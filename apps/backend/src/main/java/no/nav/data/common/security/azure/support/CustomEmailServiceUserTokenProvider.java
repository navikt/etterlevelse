package no.nav.data.common.security.azure.support;

import com.microsoft.kiota.authentication.AccessTokenProvider;
import com.microsoft.kiota.authentication.AllowedHostsValidator;

import java.net.URI;
import java.util.Map;

public class CustomEmailServiceUserTokenProvider implements AccessTokenProvider {

    private String accessToken;

    public CustomEmailServiceUserTokenProvider(String accessToken) {
        this.accessToken = accessToken;
    }

    @Override
    public String getAuthorizationToken(URI uri, Map<String, Object> additionalAuthenticationContex) {
        return accessToken;
    }

    @Override
    public AllowedHostsValidator getAllowedHostsValidator() {
        // Handle allowed hosts validation logic here
        return new AllowedHostsValidator();
    }
}
