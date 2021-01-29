package no.nav.data.common.security.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public enum AppRole {
    READ,
    WRITE,
    ADMIN,
    KRAVEIER;

    public static final String ROLE_PREFIX = "ROLE_";

    public GrantedAuthority toAuthority() {
        return new SimpleGrantedAuthority(ROLE_PREFIX + this.name());
    }
}
