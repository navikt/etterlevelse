package no.nav.data.common.security;

import no.nav.data.common.security.azure.AADStatelessAuthenticationFilter;
import no.nav.data.common.security.dto.AppRole;
import no.nav.data.common.web.UserFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

@Configuration
@EnableMethodSecurity(jsr250Enabled = true)
public class WebSecurityConfig {

    private final UserFilter userFilter = new UserFilter();

    private final AADStatelessAuthenticationFilter aadAuthFilter;
    private final SecurityProperties securityProperties;

    public WebSecurityConfig(AADStatelessAuthenticationFilter aadAuthFilter, SecurityProperties securityProperties) {
        this.aadAuthFilter = aadAuthFilter;
        this.securityProperties = securityProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(httpSecuritySessionManagementConfigurer -> httpSecuritySessionManagementConfigurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        addFilters(http);


        //Heirarchy structure. Top-down priority
        if (securityProperties == null || !securityProperties.isEnabled()) {
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        } else {
            allowAll(http,
                    "/error",
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
                    "/kravprioritylist/**",
                    "/etterlevelse/**",
                    "/etterlevelsedokumentasjon/**",
                    "/behandling/**",
                    "/tilbakemelding/**",
                    "/etterlevelsemetadata/**",
                    "/melding/**",
                    "/export/**",
                    "/statistikk/**",
                    "/team/**",
                    "/begrep/**",
                    "/etterlevelsearkiv/**",
                    "/virkemiddel/**"
            );

            adminOnly(http,
                    "/audit/**",
                    "/settings/**",
                    "/codelist/**",
                    "/export/codelist/**",
                    "/etterlevelsearkiv/status/arkivert",
                    "/etterlevelsearkiv/admin/update"
            );

            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/krav/**")).hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/tilbakemelding/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/tilbakemelding/status/**")).hasAnyRole(AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/export/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/kravprioritylist/**")).hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/etterlevelse/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/behandling/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/etterlevelsedokumentasjon/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/etterlevelsemetadata/**")).hasAnyRole(AppRole.ADMIN.name(), AppRole.WRITE.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/melding/**")).hasAnyRole(AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/etterlevelsearkiv/**")).hasAnyRole(AppRole.WRITE.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/virkemiddel/**")).hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));

            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/logout")).authenticated());

            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher("/**")).permitAll());
            http.authorizeHttpRequests(auth -> auth.anyRequest().hasRole(AppRole.WRITE.name()));
        }
        return http.build();
    }

    private void adminOnly(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher(path)).hasRole(AppRole.ADMIN.name()));
        }
    }

    private void allowAll(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher(path)).permitAll());
        }
    }

    private void allowGetAndOptions(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher(HttpMethod.GET, path)).permitAll());
            http.authorizeHttpRequests(auth -> auth.requestMatchers(antMatcher(HttpMethod.OPTIONS, path)).permitAll());
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
