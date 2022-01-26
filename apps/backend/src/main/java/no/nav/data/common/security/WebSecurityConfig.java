package no.nav.data.common.security;

import no.nav.data.common.security.azure.AADStatelessAuthenticationFilter;
import no.nav.data.common.security.dto.AppRole;
import no.nav.data.common.web.UserFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableGlobalMethodSecurity(prePostEnabled = true, jsr250Enabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserFilter userFilter = new UserFilter();

    @Autowired(required = false)
    private AADStatelessAuthenticationFilter aadAuthFilter;
    @Autowired(required = false)
    private SecurityProperties securityProperties;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .logout().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        addFilters(http);

        if (securityProperties == null || !securityProperties.isEnabled()) {
            return;
        }

        allowAll(http,
                "/login",
                "/oauth2/callback",
                "/userinfo",
                "/internal/**",
                "/swagger*/**",

                // Graphql
                "/playground*/**",
                "/voyager*/**",
                "/vendor/voyager/**",
                "/vendor/playground/**",
                "/graphql*/**"
        );

        allowGetAndOptions(http,
                "/settings/**",
                "/codelist/**",

                "/krav/**",
                "/kravprioritering/**",
                "/etterlevelse/**",
                "/behandling/**",

                "/team/**",
                "/begrep/**"
        );

        adminOnly(http,
                "/audit/**",
                "/settings/**",
                "/codelist/**"
        );

        http.authorizeRequests().antMatchers("/krav/**").hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name());
        http.authorizeRequests().antMatchers("/krav/tilbakemelding/**").hasAnyRole(AppRole.WRITE.name());
        http.authorizeRequests().antMatchers("/kravprioritering/**").hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name());
        http.authorizeRequests().antMatchers("/etterlevelse/**").hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name(), AppRole.WRITE.name());
        http.authorizeRequests().antMatchers("/behandling/**").hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name(), AppRole.WRITE.name());

        http.authorizeRequests().antMatchers("/logout").authenticated();
        http.authorizeRequests().anyRequest().hasRole(AppRole.WRITE.name());
    }

    private void adminOnly(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeRequests().antMatchers(path).hasRole(AppRole.ADMIN.name());
        }
    }

    private void allowAll(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeRequests().antMatchers(path).permitAll();
        }
    }

    private void allowGetAndOptions(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeRequests().antMatchers(HttpMethod.GET, path).permitAll();
            http.authorizeRequests().antMatchers(HttpMethod.OPTIONS, path).permitAll();
        }
    }

    private void addFilters(HttpSecurity http) {
        // In lightweight mvc tests where authfilter isnt initialized
        if (aadAuthFilter != null) {
            http.addFilterBefore(aadAuthFilter, UsernamePasswordAuthenticationFilter.class);
        }
        http.addFilterAfter(userFilter, UsernamePasswordAuthenticationFilter.class);
    }

}
