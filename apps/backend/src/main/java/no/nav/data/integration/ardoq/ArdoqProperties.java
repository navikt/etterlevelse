package no.nav.data.integration.ardoq;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "client.ardoq")
public class ArdoqProperties {
    private String baseUrl;
    private String bearerToken;
}
