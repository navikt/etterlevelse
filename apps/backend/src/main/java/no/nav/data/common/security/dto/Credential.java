package no.nav.data.common.security.dto;

import lombok.Value;
import no.nav.data.common.security.domain.Auth;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Value
public class Credential {

    String accessToken;
    Auth auth;

    public Credential(String accessToken, Auth auth) {
        this.accessToken = accessToken;
        this.auth = auth;
    }

    public Credential(String accessToken) {
        this(accessToken, null);
    }

    public Credential(Auth auth) {
        this(null, auth);
    }

    public boolean hasAuth() {
        return auth != null;
    }

    public String getAccessToken() {
        return hasAuth() ? auth.getAccessToken() : accessToken;
    }

    public static Optional<Credential> getCredential() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(Authentication::isAuthenticated)
                .map(authentication -> authentication.getCredentials() instanceof Credential c ? c : null);
    }
}
