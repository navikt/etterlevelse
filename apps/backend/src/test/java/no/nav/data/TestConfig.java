package no.nav.data;

import com.nimbusds.jwt.JWTClaimsSet.Builder;
import com.nimbusds.oauth2.sdk.id.Issuer;
import com.nimbusds.openid.connect.sdk.SubjectType;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.AppIdMapping;
import no.nav.data.common.security.azure.AADAuthenticationProperties;
import no.nav.data.common.security.azure.AADStatelessAuthenticationFilter;
import no.nav.data.common.security.azure.AzureConstants;
import no.nav.data.common.security.azure.AzureUserInfo;
import no.nav.data.common.security.dto.AppRole;
import no.nav.data.common.utils.MdcUtils;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.client.DefaultResponseErrorHandler;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Profile("test")
@Configuration
public class TestConfig {

    @Bean
    public ApplicationRunner testRestTemplate(TestRestTemplate testRestTemplate) {
        return (args) -> {
            testRestTemplate.getRestTemplate().setRequestFactory(new BufferingClientHttpRequestFactory(testRestTemplate.getRestTemplate().getRequestFactory()));
            testRestTemplate.getRestTemplate().setErrorHandler(new DefaultResponseErrorHandler() {
                @Override
                public void handleError(ClientHttpResponse response) {
                    log.error(new String(getResponseBody(response), Optional.ofNullable(getCharset(response)).orElse(Charset.defaultCharset())));
                }
            });
        };
    }

    @Bean
    public AADStatelessAuthenticationFilter aadStatelessAuthenticationFilter() throws URISyntaxException {
        return new MockFilter();
    }

    public static class MockFilter extends AADStatelessAuthenticationFilter {

        private static AzureUserInfo user;
        public static AzureUserInfo KRAVEIER = new AzureUserInfo(new Builder()
                .claim(StandardClaimNames.NAME, "Name Nameson")
                .claim(AzureConstants.IDENT_CLAIM, "A123457")
                .build(), Set.of(AppRole.KRAVEIER.toAuthority()));

        public MockFilter() throws URISyntaxException {
            super(null, null, new AppIdMapping("[]", ""), new AADAuthenticationProperties(),
                    null, new OIDCProviderMetadata(new Issuer("issuer"), List.of(SubjectType.PUBLIC), new URI("http://localhost")));
        }

        public static void setUser(AzureUserInfo user) {
            MdcUtils.setUser(user.getUserId());
            MockFilter.user = user;
        }

        public static void setUser(String ident) {
            MdcUtils.setUser(ident);
            MockFilter.user = new AzureUserInfo(new Builder()
                    .claim(StandardClaimNames.NAME, "Name Nameson")
                    .claim(AzureConstants.IDENT_CLAIM, ident)
                    .build(), Set.of(AppRole.KRAVEIER.toAuthority()));
        }

        public static void clearUser() {
            MdcUtils.clearUser();
            MockFilter.user = null;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
            try {
                if (user != null) {
                    PreAuthenticatedAuthenticationToken auth = new PreAuthenticatedAuthenticationToken(null, null);
                    auth.setAuthenticated(true);
                    auth.setDetails(user);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
                filterChain.doFilter(request, response);
            } finally {
                SecurityContextHolder.clearContext();
            }
        }
    }
}
