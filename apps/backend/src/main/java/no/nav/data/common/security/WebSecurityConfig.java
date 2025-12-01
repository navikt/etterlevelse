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
                    "/audit/log/**",
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
                    "/documentrelation/**",
                    "/behandlingenslivslop/**",
                    "/pvotilbakemelding/**",
                    "/pvkdokument/**",
                    "/risikoscenario/**",
                    "/tiltak/**",
                    "/p360/**",
                    "/nom/**",
                    "/behandlingens-art-og-omfang/**"
            );

            adminOnly(http,
                    "/audit",
                    "/audit/tableid/**",
                    "/audit/maillog/**",
                    "/settings/**",
                    "/codelist/**",
                    "/export/codelist/**"
            );

            http.authorizeHttpRequests(auth -> auth.requestMatchers("/krav/**").hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/tilbakemelding/**").hasAnyRole(AppRole.WRITE.name(), AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/tilbakemelding/status/**").hasAnyRole(AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/export/**").hasAnyRole(AppRole.WRITE.name(), AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.POST,"/p360/**").hasAnyRole(AppRole.PERSONVERNOMBUD.name(), AppRole.WRITE.name(), AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/kravprioritylist/**").hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/etterlevelse/**").hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/documentrelation/**").hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/behandling/**").hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/etterlevelsedokumentasjon/**").hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/etterlevelsemetadata/**").hasAnyRole(AppRole.ADMIN.name(), AppRole.WRITE.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/pvotilbakemelding/**").hasAnyRole(AppRole.ADMIN.name(), AppRole.PERSONVERNOMBUD.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/melding/**").hasAnyRole(AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/behandlingenslivslop/**").hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/pvkdokument/**").hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/pvkdokument/pvo").hasAnyRole(AppRole.PERSONVERNOMBUD.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/risikoscenario/**").hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/tiltak/**").hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers("/behandlingens-art-og-omfang/**").hasAnyRole(AppRole.WRITE.name(), AppRole.ADMIN.name()));

            http.authorizeHttpRequests(auth -> auth.requestMatchers("/logout").authenticated());

            http.authorizeHttpRequests(auth -> auth.requestMatchers("/**").permitAll());
            http.authorizeHttpRequests(auth -> auth.anyRequest().hasRole(AppRole.WRITE.name()));
        }
        return http.build();
    }

    private void adminOnly(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(path).hasRole(AppRole.ADMIN.name()));
        }
    }

    private void allowAll(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(path).permitAll());
        }
    }

    private void allowGetAndOptions(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.GET, path).permitAll());
            http.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.OPTIONS, path).permitAll());
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
