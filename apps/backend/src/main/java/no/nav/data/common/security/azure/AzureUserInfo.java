package no.nav.data.common.security.azure;

import com.nimbusds.jwt.JWTClaimsSet;
import lombok.Value;
import no.nav.data.common.security.AppIdMapping;
import no.nav.data.common.security.dto.AppRole;
import no.nav.data.common.security.dto.UserInfo;
import no.nav.data.common.security.dto.UserInfoResponse;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;

import java.util.List;
import java.util.Set;

import static no.nav.data.common.security.azure.AzureConstants.APPID_CLAIM;
import static no.nav.data.common.security.azure.AzureConstants.APPID_CLAIM_V2;
import static no.nav.data.common.security.azure.AzureConstants.USER_ID_CLAIM;
import static no.nav.data.common.security.azure.AzureConstants.VER_CLAIM;
import static no.nav.data.common.security.dto.AppRole.ROLE_PREFIX;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.copyOf;
import static org.apache.commons.lang3.StringUtils.substringAfter;

@Value
public class AzureUserInfo implements UserInfo {

    private String appId;
    private String userId;
    private String ident;
    private String name;
    private String email;
    private List<String> groups;

    public AzureUserInfo(JWTClaimsSet jwtClaimsSet, Set<GrantedAuthority> grantedAuthorities) {
        this.appId = getAppId(jwtClaimsSet);
        this.ident = getClaim(jwtClaimsSet, AzureConstants.IDENT_CLAIM);
        this.userId = getUserId(jwtClaimsSet);

        this.name = getClaim(jwtClaimsSet, StandardClaimNames.NAME);
        this.email = getEmail(jwtClaimsSet);
        groups = convert(grantedAuthorities, grantedAuthority -> substringAfter(grantedAuthority.getAuthority(), ROLE_PREFIX));
    }

    public static String getAppId(JWTClaimsSet jwtClaimsSet) {
        if (isV1(jwtClaimsSet)) {
            return (String) jwtClaimsSet.getClaim(APPID_CLAIM);
        }
        return (String) jwtClaimsSet.getClaim(APPID_CLAIM_V2);
    }

    public static String getUserId(JWTClaimsSet jwtClaimsSet) {
        return (String) jwtClaimsSet.getClaim(USER_ID_CLAIM);
    }

    private String getEmail(JWTClaimsSet jwtClaimsSet) {
        if (isV1(jwtClaimsSet)) {
            return getClaim(jwtClaimsSet, "unique_name");
        }
        return (String) jwtClaimsSet.getClaim(StandardClaimNames.PREFERRED_USERNAME);
    }

    private static boolean isV1(JWTClaimsSet jwtClaimsSet) {
        return "1.0".equals(getClaim(jwtClaimsSet, VER_CLAIM));
    }

    public String getIdentName() {
        return String.format("%s - %s", ident, name);
    }

    public String getAppName() {
        return AppIdMapping.getAppNameForAppId(appId);
    }

    @SuppressWarnings("unchecked")
    private static <T> T getClaim(JWTClaimsSet jwtClaimsSet, String claim) {
        return (T) jwtClaimsSet.getClaim(claim);
    }

    @Override
    public boolean isAdmin() {
        return groups.contains(AppRole.ADMIN.name());
    }

    @Override
    public boolean isKravEier() {
        return groups.contains(AppRole.KRAVEIER.name()) || isAdmin();
    }

    public UserInfoResponse toResponse() {
        return UserInfoResponse.builder()
                .loggedIn(true)
                .ident(ident)
                .name(name)
                .email(email)
                .groups(copyOf(groups))
                .build();
    }
}
