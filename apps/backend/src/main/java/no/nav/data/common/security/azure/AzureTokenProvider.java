package no.nav.data.common.security.azure;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.microsoft.aad.msal4j.AuthorizationCodeParameters;
import com.microsoft.aad.msal4j.AuthorizationRequestUrlParameters;
import com.microsoft.aad.msal4j.ClientCredentialParameters;
import com.microsoft.aad.msal4j.ConfidentialClientApplication;
import com.microsoft.aad.msal4j.IAuthenticationResult;
import com.microsoft.aad.msal4j.IConfidentialClientApplication;
import com.microsoft.aad.msal4j.PublicClientApplication;
import com.microsoft.aad.msal4j.RefreshTokenParameters;
import com.microsoft.aad.msal4j.ResponseMode;
import com.microsoft.aad.msal4j.UserNamePasswordParameters;
import com.microsoft.graph.concurrency.DefaultExecutors;
import com.microsoft.graph.logger.DefaultLogger;
import com.microsoft.graph.models.extensions.IGraphServiceClient;
import com.microsoft.graph.requests.extensions.GraphServiceClient;
import com.nimbusds.oauth2.sdk.pkce.CodeChallengeMethod;
import io.prometheus.client.Summary;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.Constants;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.security.AuthService;
import no.nav.data.common.security.Encryptor;
import no.nav.data.common.security.TokenProvider;
import no.nav.data.common.security.azure.support.AuthResultExpiry;
import no.nav.data.common.security.azure.support.GraphLogger;
import no.nav.data.common.security.domain.Auth;
import no.nav.data.common.security.dto.Credential;
import no.nav.data.common.security.dto.OAuthState;
import no.nav.data.common.utils.MetricUtils;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ThreadPoolExecutor;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.security.SecurityConstants.SESS_ID_LEN;
import static no.nav.data.common.security.SecurityConstants.TOKEN_TYPE;
import static no.nav.data.common.security.azure.AzureConstants.MICROSOFT_GRAPH_SCOPES;

@Slf4j
@Service
public class AzureTokenProvider implements TokenProvider {

    private final Cache<String, IAuthenticationResult> accessTokenCache;

    private final IConfidentialClientApplication msalClient;
    private final PublicClientApplication msalPublicClient;
    private final AuthService authService;
    private final MdcMsalExecutor msalExecutor;
    private final ConfidentialClientApplication confidentialClientApplication;

    private final AADAuthenticationProperties aadAuthProps;
    private final Encryptor encryptor;

    private final Summary tokenMetrics;

    public AzureTokenProvider(AADAuthenticationProperties aadAuthProps,
            IConfidentialClientApplication msalClient, PublicClientApplication msalPublicClient,
            AuthService authService, ThreadPoolExecutor msalThreadPool,
            ConfidentialClientApplication confidentialClientApplication, Encryptor encryptor) {
        this.aadAuthProps = aadAuthProps;
        this.msalClient = msalClient;
        this.msalPublicClient = msalPublicClient;
        this.authService = authService;
        this.msalExecutor = new MdcMsalExecutor(msalThreadPool);
        this.confidentialClientApplication = confidentialClientApplication;
        this.encryptor = encryptor;
        this.tokenMetrics = MetricUtils.summary()
                .labels("accessToken")
                .labelNames("action")
                .name(Constants.APP_ID.replace('-', '_') + "_token_summary")
                .help("Time taken for azure token lookups")
                .quantile(.5, .01).quantile(.9, .01).quantile(.99, .001)
                .maxAgeSeconds(Duration.ofHours(24).getSeconds())
                .ageBuckets(8)
                .register();

        this.accessTokenCache = Caffeine.newBuilder().recordStats()
                .expireAfter(new AuthResultExpiry())
                .maximumSize(1000).build();
        MetricUtils.register("accessTokenCache", accessTokenCache);
    }

    IGraphServiceClient getGraphClient(String accessToken) {
        return GraphServiceClient.builder()
                .authenticationProvider(request -> request.addHeader(HttpHeaders.AUTHORIZATION, TOKEN_TYPE + accessToken))
                .executors(msalExecutor)
                .logger(new GraphLogger())
                .buildClient();
    }

    String getConsumerToken(String resource, String appIdUri) {
        return Credential.getCredential()
                .filter(Credential::hasAuth)
                .map(cred -> TOKEN_TYPE + getAccessTokenForResource(cred.getAuth().decryptRefreshToken(), resource))
                .orElseGet(() -> TOKEN_TYPE + getApplicationTokenForResource(appIdUri));
    }

    public Auth getAuth(String session) {
        Assert.isTrue(session.length() > SESS_ID_LEN, "invalid session");
        var sessionId = session.substring(0, SESS_ID_LEN);
        var sessionKey = session.substring(SESS_ID_LEN);
        var auth = authService.getAuth(sessionId, sessionKey);
        try {
            String accessToken = getAccessTokenForResource(auth.decryptRefreshToken(), resourceForAppId());
            auth.addAccessToken(accessToken);
            return auth;
        } catch (RuntimeException e) {
            throw new TechnicalException("Failed to get access token for userId=%s initiated=%s".formatted(auth.getUserId(), auth.getInitiated()));
        }
    }

    @Override
    public void destroySession() {
        Credential.getCredential().map(Credential::getAuth).ifPresent(auth -> authService.endSession(auth.getId()));
    }

    @Override
    public String createAuthRequestRedirectUrl(String postLoginRedirectUri, String postLoginErrorUri, String redirectUri) {
        var auth = authService.createAuth();
        var codeVerifier = auth.getCodeVerifier();
        var s256 = DigestUtils.sha256(codeVerifier);
        var codeChallenge = Base64.encodeBase64URLSafeString(s256);
        URL url = confidentialClientApplication.getAuthorizationRequestUrl(AuthorizationRequestUrlParameters
                .builder(redirectUri, MICROSOFT_GRAPH_SCOPES)
                .state(new OAuthState(auth.getId().toString(), postLoginRedirectUri, postLoginErrorUri).toJson(encryptor))
                .responseMode(ResponseMode.FORM_POST)
                .codeChallengeMethod(CodeChallengeMethod.S256.getValue())
                .codeChallenge(codeChallenge)
                .build());
        return url.toString();
    }

    @Override
    public String createSession(String sessionId, String code, String redirectUri) {
        try {
            log.debug("Looking up token for auth code");
            var codeVerifier = authService.getCodeVerifier(sessionId);
            var authResult = msalClient.acquireToken(AuthorizationCodeParameters
                    .builder(code, new URI(redirectUri))
                    .scopes(MICROSOFT_GRAPH_SCOPES)
                    .codeVerifier(codeVerifier)
                    .build()).get();
            String userId = StringUtils.substringBefore(authResult.account().homeAccountId(), ".");
            String refreshToken = getRefreshTokenFromAuthResult(authResult);
            return authService.initAuth(userId, refreshToken, sessionId);
        } catch (Exception e) {
            log.error("Failed to get token for auth code", e);
            throw new TechnicalException("Failed to get token for auth code", e);
        }
    }

    private String getRefreshTokenFromAuthResult(IAuthenticationResult authResult) throws ClassNotFoundException, IllegalAccessException, InvocationTargetException {
        // interface is missing refreshToken...
        Method refreshTokenMethod = ReflectionUtils.findMethod(Class.forName("com.microsoft.aad.msal4j.AuthenticationResult"), "refreshToken");
        Assert.notNull(refreshTokenMethod, "couldn't find refreshToken method");
        refreshTokenMethod.setAccessible(true);
        return (String) refreshTokenMethod.invoke(authResult);
    }

    private String resourceForAppId() {
        return aadAuthProps.getClientId() + "/.default";
    }


    String getApplicationTokenForResource(String resource) {
        log.trace("Getting application token for resource {}", resource);
        return requireNonNull(accessTokenCache.get("credential" + resource, cacheKey -> acquireTokenByCredential(resource))).accessToken();
    }

    private String getAccessTokenForResource(String refreshToken, String resource) {
        log.trace("Getting access token for resource {}", resource);
        return requireNonNull(accessTokenCache.get("refresh" + refreshToken + resource, cacheKey -> acquireTokenByRefreshToken(refreshToken, resource))).accessToken();
    }

    public String getMailAccessToken() {
        log.trace("Getting access token for mail");
        return requireNonNull(accessTokenCache.get("mail", cacheKey -> acquireTokenForUser(Set.of("Mail.Send"), aadAuthProps.getMailUser(), aadAuthProps.getMailPassword())))
                .accessToken();
    }

    private IAuthenticationResult acquireTokenByRefreshToken(String refreshToken, String resource) {
        try (var ignored = tokenMetrics.labels("accessToken").startTimer()) {
            log.debug("Looking up access token for resource {}", resource);
            return msalClient.acquireToken(RefreshTokenParameters.builder(Set.of(resource), refreshToken).build()).get();
        } catch (Exception e) {
            throw new TechnicalException("Failed to get access token for refreshToken", e);
        }
    }

    /**
     * used for email user
     */
    private IAuthenticationResult acquireTokenForUser(Set<String> scopes, String username, String password) {
        try {
            log.debug("Looking up access token for user {}", username);
            return msalPublicClient.acquireToken(UserNamePasswordParameters.builder(scopes, username, password.toCharArray()).build()).get();
        } catch (Exception e) {
            throw new TechnicalException("Failed to get access token for username " + username, e);
        }
    }

    /**
     * access token for app user
     */
    private IAuthenticationResult acquireTokenByCredential(String resource) {
        try {
            log.debug("Looking up application token for resource {}", resource);
            return msalClient.acquireToken(ClientCredentialParameters.builder(Set.of(resource)).build()).get();
        } catch (Exception e) {
            throw new TechnicalException("Failed to get access token for credential", e);
        }
    }

    private static class MdcMsalExecutor extends DefaultExecutors {

        static Field backgroundExecutor;

        static {
            backgroundExecutor = ReflectionUtils.findField(DefaultExecutors.class, "backgroundExecutor", ThreadPoolExecutor.class);
            Assert.notNull(backgroundExecutor, "couldn't find executor field");
            backgroundExecutor.setAccessible(true);
        }

        public MdcMsalExecutor(ThreadPoolExecutor threadPoolExecutor) {
            super(new DefaultLogger());
            try {
                backgroundExecutor.set(this, threadPoolExecutor);
            } catch (Exception e) {
                throw new TechnicalException("reflection error", e);
            }
        }
    }

}
