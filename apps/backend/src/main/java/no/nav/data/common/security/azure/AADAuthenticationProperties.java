package no.nav.data.common.security.azure;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("azure.activedirectory")
@Data
public class AADAuthenticationProperties {

    private String clientId;
    private String clientSecret;
    private String wellKnown;
    private String allowedAppIdMappings = "";
    private String mailUser;
    private String mailPassword;

}
