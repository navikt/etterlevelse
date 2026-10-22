package no.nav.data;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.nimbusds.jwt.JWTClaimsSet.Builder;
import com.nimbusds.oauth2.sdk.id.Issuer;
import com.nimbusds.openid.connect.sdk.SubjectType;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import no.nav.data.common.security.AppIdMapping;
import no.nav.data.common.security.azure.AADAuthenticationProperties;
import no.nav.data.common.security.azure.AADStatelessAuthenticationFilter;
import no.nav.data.common.security.azure.AzureConstants;
import no.nav.data.common.security.azure.AzureUserInfo;
import no.nav.data.common.security.dto.AppRole;
import no.nav.data.integration.ardoq.dto.ArdoqSystem;
import no.nav.data.integration.ardoq.dto.ArdoqSystemData;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.ResourceType;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;

import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static no.nav.data.common.utils.JsonUtils.toJson;

/**
 * Replaces the Azure auth filter so every request is logged in as a local user with all roles when running LocalAppStarter.
 * Override with -Dlocal.user.ident=..., -Dlocal.user.name=... and -Dlocal.user.email=...
 */
@Profile("local")
@Configuration
public class LocalConfig {

    private static final String AAD_FILTER_BEAN = "aadStatelessAuthenticationFilter";

    @Bean
    public static BeanDefinitionRegistryPostProcessor localUserFilterRegistrar(Environment environment) {
        return new BeanDefinitionRegistryPostProcessor() {
            @Override
            public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
                if (registry.containsBeanDefinition(AAD_FILTER_BEAN)) {
                    registry.removeBeanDefinition(AAD_FILTER_BEAN);
                }
                String ident = environment.getProperty("local.user.ident", "FullStackLocal");
                String name = environment.getProperty("local.user.name", "Lokal Utvikler");
                String email = environment.getProperty("local.user.email", ident.toLowerCase() + "@nav.no");
                stubTeamcatResource(ident, name, email);
                stubArdoqSystems();
                registry.registerBeanDefinition(AAD_FILTER_BEAN,
                        new RootBeanDefinition(LocalUserFilter.class, () -> new LocalUserFilter(ident, name, email)));
            }

            @Override
            public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
            }
        };
    }

    // Teamkatalogen is mocked by WireMock (started in LocalAppStarter); the local user must exist there for flows like tilbakemelding.
    private static void stubTeamcatResource(String ident, String name, String email) {
        int split = name.lastIndexOf(' ');
        var resource = Resource.builder()
                .navIdent(ident)
                .givenName(split > 0 ? name.substring(0, split) : name)
                .familyName(split > 0 ? name.substring(split + 1) : "")
                .fullName(name)
                .email(email)
                .resourceType(ResourceType.INTERNAL)
                .build();
        WireMock.stubFor(get("/teamcat/resource/" + ident).willReturn(okJson(toJson(resource))));
    }

    // Ardoq requires a secret bearer token, so local runs get a few fake systems from WireMock instead.
    private static void stubArdoqSystems() {
        var systems = List.of(
                ardoqSystem("LOCAL-1", "Lokalt testsystem A", "TSA"),
                ardoqSystem("LOCAL-2", "Lokalt testsystem B", "TSB"),
                ardoqSystem("LOCAL-3", "Lokalt saksbehandlingssystem", "SAK"),
                ardoqSystem("LOCAL-4", "Lokalt arkivsystem", "ARKIV"),
                ardoqSystem("LOCAL-5", "Lokal selvbetjeningsløsning", "SELV")
        );
        WireMock.stubFor(get(urlPathMatching("/ardoq/api/v2/reports/.*/run/objects"))
                .willReturn(okJson(toJson(ArdoqSystemData.builder().values(systems).build()))));
    }

    private static ArdoqSystem ardoqSystem(String id, String name, String alias) {
        return ArdoqSystem.builder()
                .ardoqID(id)
                .ardoqOID(id.toLowerCase())
                .name(name)
                .alias(alias)
                .lifecyclePhase("Production")
                .description("Fiktivt system for lokal utvikling")
                .build();
    }

    static class LocalUserFilter extends AADStatelessAuthenticationFilter {

        private final AzureUserInfo user;
        private final Set<GrantedAuthority> authorities;

        LocalUserFilter(String ident, String name, String email) {
            super(null, null, new AppIdMapping("[]", ""), new AADAuthenticationProperties(),
                    null, new OIDCProviderMetadata(new Issuer("issuer"), List.of(SubjectType.PUBLIC), URI.create("http://localhost")));
            this.authorities = Arrays.stream(AppRole.values()).map(AppRole::toAuthority).collect(Collectors.toSet());
            this.user = new AzureUserInfo(new Builder()
                    .claim(StandardClaimNames.NAME, name)
                    .claim(AzureConstants.IDENT_CLAIM, ident)
                    .claim(StandardClaimNames.PREFERRED_USERNAME, email)
                    .build(), authorities);
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
            try {
                var auth = new PreAuthenticatedAuthenticationToken(user.getIdent(), null, authorities);
                auth.setDetails(user);
                SecurityContextHolder.getContext().setAuthentication(auth);
                filterChain.doFilter(request, response);
            } finally {
                SecurityContextHolder.clearContext();
            }
        }
    }
}
