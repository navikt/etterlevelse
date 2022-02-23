package no.nav.data.common.swagger;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityScheme.Type;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .components(new Components().addSecuritySchemes("bearer-key",
                        new SecurityScheme().type(Type.HTTP).scheme("bearer").bearerFormat("token")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-key"))
                .info(new Info().title("Etterlevelse")
                        .description("Rest API for Etterlevelse")
                        .version("v1.0")
                        .license(new License().name("MIT License")))
                .externalDocs(new ExternalDocumentation()
                        .description("Etterlevelse på NAKA")
                        .url("https://navikt.github.io/naka/etterlevelse"));
    }
}
