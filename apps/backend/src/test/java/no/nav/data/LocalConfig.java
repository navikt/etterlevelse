package no.nav.data;

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

/**
 * Replaces the Azure auth filter so every request is logged in as a local user with all roles when running LocalAppStarter.
 * Override with -Dlocal.user.ident=... and -Dlocal.user.name=...
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
                registry.registerBeanDefinition(AAD_FILTER_BEAN,
                        new RootBeanDefinition(LocalUserFilter.class, () -> new LocalUserFilter(ident, name)));
            }

            @Override
            public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
            }
        };
    }

    static class LocalUserFilter extends AADStatelessAuthenticationFilter {

        private final AzureUserInfo user;
        private final Set<GrantedAuthority> authorities;

        LocalUserFilter(String ident, String name) {
            super(null, null, new AppIdMapping("[]", ""), new AADAuthenticationProperties(),
                    null, new OIDCProviderMetadata(new Issuer("issuer"), List.of(SubjectType.PUBLIC), URI.create("http://localhost")));
            this.authorities = Arrays.stream(AppRole.values()).map(AppRole::toAuthority).collect(Collectors.toSet());
            this.user = new AzureUserInfo(new Builder()
                    .claim(StandardClaimNames.NAME, name)
                    .claim(AzureConstants.IDENT_CLAIM, ident)
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
