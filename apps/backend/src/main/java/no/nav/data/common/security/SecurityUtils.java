package no.nav.data.common.security;

import lombok.experimental.UtilityClass;
import no.nav.data.common.exceptions.ForbiddenException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.security.dto.UserInfo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@UtilityClass
public class SecurityUtils {

    public static Optional<UserInfo> getCurrentUser() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(Authentication::isAuthenticated)
                .map(authentication -> authentication.getDetails() instanceof UserInfo ui ? ui : null);
    }

    public static Optional<String> lookupCurrentIdent() {
        return getCurrentUser().map(UserInfo::getIdent);
    }

    public static String getCurrentIdent() {
        return lookupCurrentIdent().orElseThrow(() -> new ValidationException("Invalid user, no ident found"));
    }

    public static boolean isAdmin() {
        return getCurrentUser().map(UserInfo::isAdmin).orElse(false);
    }

    public static boolean isKravEier() {
        return getCurrentUser().map(UserInfo::isKravEier).orElse(false);
    }

    public static boolean isUserOrAdmin(String ident) {
        return getCurrentIdent().equals(ident) || isAdmin();
    }

    public static void assertIsUserOrAdmin(String ident, String message) {
        if (!isUserOrAdmin(ident)) {
            throw new ForbiddenException(message);
        }
    }

}
