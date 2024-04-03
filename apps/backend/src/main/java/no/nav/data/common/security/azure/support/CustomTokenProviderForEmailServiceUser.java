package no.nav.data.common.security.azure.support;

import com.microsoft.kiota.authentication.AccessTokenProvider;
import com.microsoft.kiota.authentication.AllowedHostsValidator;
import org.jetbrains.annotations.NotNull;

import java.net.URI;
import java.util.Map;

public class CustomTokenProviderForEmailServiceUser implements AccessTokenProvider {

    private final String accessToken;

    public CustomTokenProviderForEmailServiceUser(String accessToken) {
        this.accessToken = accessToken;
    }

    @Override
    public @NotNull String getAuthorizationToken(@NotNull URI uri, Map<String, Object> additionalAuthenticationContex) {
        return accessToken;
    }

    @Override
    public @NotNull AllowedHostsValidator getAllowedHostsValidator() {
        // Handle allowed hosts validation logic here
        return new AllowedHostsValidator();
    }
}
