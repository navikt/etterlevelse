package no.nav.data.integration.p360;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "client.p360")
public class P360Properties {
    private String url;
    private String caseUrl;
    private String documentUrl;
    private String authKey;
    private String clientId;
    private String clientSecret;
    private String tokenUrl;
}
