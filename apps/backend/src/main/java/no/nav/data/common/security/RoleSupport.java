package no.nav.data.common.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.dto.AppRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import static no.nav.data.common.security.dto.AppRole.ROLE_PREFIX;
import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleSupport {

    private final SecurityProperties securityProperties;

    public Set<GrantedAuthority> lookupGrantedAuthorities(List<String> groupIds) {
        Set<GrantedAuthority> roles = groupIds.stream()
                .map(this::roleFor)
                .filter(Objects::nonNull)
                .map(this::convertAuthority)
                .collect(Collectors.toSet());
        roles.add(convertAuthority(AppRole.READ.name()));
        log.trace("roles {}", convert(roles, GrantedAuthority::getAuthority));
        return roles;
    }

    /**
     * token v2 does not allow us to fetch group details, so we have to map by id instead
     */
    private String roleFor(String group) {
        if (securityProperties.getWriteGroups().contains(group)) {
            return AppRole.WRITE.name();
        }
        if (securityProperties.getAdminGroups().contains(group)) {
            return AppRole.ADMIN.name();
        }
        // for future - add team -> system roles here
        return null;
    }

    private GrantedAuthority convertAuthority(String role) {
        return new SimpleGrantedAuthority(ROLE_PREFIX + role);
    }

}
