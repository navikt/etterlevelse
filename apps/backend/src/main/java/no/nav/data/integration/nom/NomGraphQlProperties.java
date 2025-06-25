package no.nav.data.integration.nom;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "client.nom.graphql")
public class NomGraphQlProperties {

    private String url;
}
