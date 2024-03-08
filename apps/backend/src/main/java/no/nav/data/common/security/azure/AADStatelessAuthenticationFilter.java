package no.nav.data.common.security.azure;

import com.auth0.jwk.JwkException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.util.ResourceRetriever;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.BadJWTException;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jwt.proc.JWTClaimsSetVerifier;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import io.prometheus.client.Counter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.AppIdMapping;
import no.nav.data.common.security.AuthController;
import no.nav.data.common.security.RoleSupport;
import no.nav.data.common.security.domain.Auth;
import no.nav.data.common.security.dto.AppRole;
import no.nav.data.common.security.dto.Credential;
import no.nav.data.common.security.jwt.JwtValidator;
import no.nav.data.common.utils.MetricUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.MalformedURLException;
import java.text.ParseException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static no.nav.data.Constants.COOKIE_NAME;
import static no.nav.data.common.security.SecurityConstants.TOKEN_TYPE;
import static no.nav.data.common.security.SecurityConstants.TOKEN_USER;
import static org.springframework.util.StringUtils.hasText;

@Slf4j
public class AADStatelessAuthenticationFilter extends OncePerRequestFilter {

    private static final Counter counter = initCounter();

    private final AzureTokenProvider azureTokenProvider;
    private final RoleSupport roleSupport;
    private final List<String> allowedAppIds;
    private final OIDCProviderMetadata oidcProviderMetadata;
    private final JWKSource<SecurityContext> keySource;

    public AADStatelessAuthenticationFilter(AzureTokenProvider azureTokenProvider, RoleSupport roleSupport, AppIdMapping appIdMapping,
            AADAuthenticationProperties aadAuthProps, ResourceRetriever resourceRetriever, OIDCProviderMetadata oidcProviderMetadata) {
        this.azureTokenProvider = azureTokenProvider;
        this.roleSupport = roleSupport;
        this.allowedAppIds = List.copyOf(appIdMapping.getIds());
        this.oidcProviderMetadata = oidcProviderMetadata;

        // azure spring
        this.validAudiences.add(aadAuthProps.getClientId());
        try {
            keySource = new RemoteJWKSet<>(oidcProviderMetadata.getJWKSetURI().toURL(), resourceRetriever);
        } catch (MalformedURLException e) {
            log.error("Failed to parse active directory key discovery uri.", e);
            throw new IllegalStateException("Failed to parse active directory key discovery uri.", e);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        boolean cleanupRequired = false;

        if (StringUtils.startsWith(request.getServletPath(), "/login")) {
            counter.labels("login").inc();
        } else {
            cleanupRequired = authenticate(request, response);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            if (cleanupRequired) {
                SecurityContextHolder.clearContext();
            }
        }
    }

    private boolean authenticate(HttpServletRequest request, HttpServletResponse response) throws ServletException {
        Credential credential = getCredential(request, response);
        if (credential != null) {
            if(credential.getAccessToken().startsWith(TOKEN_USER)) {
                String plainToken = StringUtils.deleteWhitespace(credential.getAccessToken().replaceFirst(TOKEN_USER, ""));
                try{
                    var principal = buildAndValidateFromJavaJwt(plainToken);
                    var authentication = new PreAuthenticatedAuthenticationToken(principal, credential, Arrays.asList(AppRole.ADMIN.toAuthority()));
                    //Filling in service user info for finer/prettier audit log
                    //ESU -> Etterlevlese Service User
                    authentication.setDetails(new AzureUserInfo(new JWTClaimsSet.Builder()
                            .claim(StandardClaimNames.NAME, "service user for archiving")
                            .claim(AzureConstants.IDENT_CLAIM, "ESU-001")
                            .build(), Set.of(AppRole.ADMIN.toAuthority())));
                    authentication.setAuthenticated(true);
                    log.trace("Request token verification success with roles system.");
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    return true;
                }catch (JwkException e){
                    String errorMessage = "Invalid JWT. Either expired or not yet valid. " + e;
                    log.warn(errorMessage);
                    throw new ServletException(errorMessage);
                }
            } else {
                try {
                    var principal = buildUserPrincipal(credential.getAccessToken());
                    var grantedAuthorities = roleSupport.lookupGrantedAuthorities(principal.getStringListClaim("groups"));
                    var authentication = new PreAuthenticatedAuthenticationToken(principal, credential, grantedAuthorities);
                    authentication.setDetails(new AzureUserInfo(principal, grantedAuthorities));
                    authentication.setAuthenticated(true);
                    log.trace("Request token verification success for subject {} with roles {}.", AzureUserInfo.getUserId(principal), grantedAuthorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    return true;
                } catch (BadJWTException ex) {
                    String errorMessage = "Invalid JWT. Either expired or not yet valid. " + ex.getMessage();
                    log.warn(errorMessage);
                    throw new ServletException(errorMessage, ex);
                } catch (ParseException | BadJOSEException | JOSEException ex) {
                    log.error("Failed to initialize UserPrincipal.", ex);
                    throw new ServletException(ex);
                }
            }
        } else {
            if (!StringUtils.startsWith(request.getServletPath(), "/internal")) {
                counter.labels("no_auth").inc();
            }
        }
        return false;
    }

    private Credential getCredential(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() != null) {
            Optional<Cookie> cookie = Stream.of(request.getCookies())
                    .filter(c -> c.getName().equals(COOKIE_NAME))
                    .findFirst();
            if (cookie.isPresent()) {
                try {
                    String session = cookie.get().getValue();
                    Auth auth = azureTokenProvider.getAuth(session);
                    counter.labels("cookie").inc();
                    return new Credential(auth);
                } catch (Exception e) {
                    log.warn("Invalid auth cookie", e);
                    response.addCookie(AuthController.createCookie(null, 0, request));
                    return null;
                }
            }
        }
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (hasText(authHeader)) {
            String authHeader1 = request.getHeader(HttpHeaders.AUTHORIZATION);
            String token = authHeader1;
            if(authHeader.startsWith(TOKEN_TYPE)) {
                token = authHeader1.replaceFirst(TOKEN_TYPE, "");
            }
            counter.labels("direct_token").inc();
            return new Credential(token);
        }
        return null;
    }

    private JWTClaimsSet buildUserPrincipal(String token) throws ParseException, JOSEException, BadJOSEException {
        var principal = buildAndValidateClaims(token);
        String appIdClaim = AzureUserInfo.getAppId(principal);
        if (appIdClaim == null || !allowedAppIds.contains(appIdClaim)) {
            throw new BadJWTException("Invalid token appId. Provided value " + appIdClaim + " does not match allowed appId");
        }
        return principal;
    }

    private JWTClaimsSet buildAndValidateFromJavaJwt(String token) throws JwkException{
        DecodedJWT jwt = JwtValidator.isJwtTokenValid(token);
        var principal = new JWTClaimsSet.Builder();
        return principal
                .audience(jwt.getAudience())
                .issuer(jwt.getIssuer())
                .expirationTime(jwt.getExpiresAt())
                .issueTime(jwt.getIssuedAt())
                .jwtID(jwt.getId())
                .subject(jwt.getSubject())
                .notBeforeTime(jwt.getNotBefore())
                .build();
    }

    private static Counter initCounter() {
        return MetricUtils.counter()
                .labels("no_auth").labels("cookie").labels("direct_token").labels("login")
                .name("auth_counter")
                .help("Counter for authentication events")
                .labelNames("action")
                .register();
    }

    // From spring azure start
    private final Set<String> validAudiences = new HashSet<>();

    public JWTClaimsSet buildAndValidateClaims(String idToken) throws ParseException, BadJOSEException, JOSEException {
        final JWSObject jwsObject = JWSObject.parse(idToken);
        final ConfigurableJWTProcessor<SecurityContext> validator =
                getAadJwtTokenValidator(jwsObject.getHeader().getAlgorithm());
        final JWTClaimsSet jwtClaimsSet = validator.process(idToken, null);
        final JWTClaimsSetVerifier<SecurityContext> verifier = validator.getJWTClaimsSetVerifier();
        verifier.verify(jwtClaimsSet, null);

        return jwtClaimsSet;
    }

    private ConfigurableJWTProcessor<SecurityContext> getAadJwtTokenValidator(JWSAlgorithm jwsAlgorithm) {
        final ConfigurableJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();

        final JWSKeySelector<SecurityContext> keySelector =
                new JWSVerificationKeySelector<>(jwsAlgorithm, keySource);
        jwtProcessor.setJWSKeySelector(keySelector);

        jwtProcessor.setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>(null, null, null, null) {
            @Override
            public void verify(JWTClaimsSet claimsSet, SecurityContext ctx) throws BadJWTException {
                super.verify(claimsSet, ctx);
                final String issuer = claimsSet.getIssuer();
                if (issuer == null || !issuer.equals(oidcProviderMetadata.getIssuer().getValue())) {
                    throw new BadJWTException("Invalid token issuer " + issuer);
                }
                final Optional<String> matchedAudience = claimsSet.getAudience().stream().filter(validAudiences::contains).findFirst();
                if (matchedAudience.isPresent()) {
                    log.trace("Matched audience [{}]", matchedAudience.get());
                } else {
                    throw new BadJWTException("Invalid token audience. Provided value " + claimsSet.getAudience() + "does not match neither client-id nor AppIdUri.");
                }
            }
        });
        return jwtProcessor;
    }

}
