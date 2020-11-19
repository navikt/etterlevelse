package no.nav.data.common.security;

import com.fasterxml.jackson.core.type.TypeReference;
import lombok.Data;
import no.nav.data.Constants;
import no.nav.data.common.utils.JsonUtils;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AppIdMapping {

    public static final TypeReference<List<AuthApps>> AUTH_APP_LIST = new TypeReference<>() {
    };

    private static final Map<String, String> appIdAppNameMap = new HashMap<>();

    public AppIdMapping(String mappings, String thisAppId) {
        appIdAppNameMap.put(thisAppId, Constants.APP_ID);
        List<AuthApps> authApps = JsonUtils.readValue(mappings, AUTH_APP_LIST);
        authApps.forEach(app -> appIdAppNameMap.put(app.clientId, app.name));
    }

    public static String getAppNameForAppId(String appId) {
        return appId == null ? null : appIdAppNameMap.getOrDefault(appId, "not-found");
    }

    public Collection<String> getIds() {
        return appIdAppNameMap.keySet();
    }

    @Data
    static class AuthApps {

        private String name;
        private String clientId;
    }
}
