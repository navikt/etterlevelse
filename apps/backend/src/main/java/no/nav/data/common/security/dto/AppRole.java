package no.nav.data.common.security.dto;

public enum AppRole {
    READ,
    WRITE,
    ADMIN,
    KRAVEIER;

    public static final String ROLE_PREFIX = "ROLE_";
}
