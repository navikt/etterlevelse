package no.nav.data.common.security.azure;

import com.microsoft.aad.msal4j.ClientCredentialFactory;
import com.microsoft.aad.msal4j.ConfidentialClientApplication;
import com.microsoft.aad.msal4j.PublicClientApplication;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.util.DefaultResourceRetriever;
import com.nimbusds.jose.util.ResourceRetriever;
import com.nimbusds.oauth2.sdk.id.Issuer;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderConfigurationRequest;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import lombok.SneakyThrows;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.security.AppIdMapping;
import no.nav.data.common.security.RoleSupport;
import no.nav.data.common.utils.MdcExecutor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class AzureConfig {

    @Bean
    public ResourceRetriever getJWTResourceRetriever() {
        return new DefaultResourceRetriever(RemoteJWKSet.DEFAULT_HTTP_CONNECT_TIMEOUT * 2, RemoteJWKSet.DEFAULT_HTTP_READ_TIMEOUT * 2, RemoteJWKSet.DEFAULT_HTTP_SIZE_LIMIT);
    }

    @Bean
    public AADStatelessAuthenticationFilter aadStatelessAuthenticationFilter(
            ResourceRetriever resourceRetriever, AADAuthenticationProperties aadAuthProps, RoleSupport roleSupport,
            AzureTokenProvider azureTokenProvider, AppIdMapping appIdMapping, OIDCProviderMetadata oidcProviderMetadata) {
        return new AADStatelessAuthenticationFilter(azureTokenProvider, roleSupport, appIdMapping, aadAuthProps, resourceRetriever, oidcProviderMetadata);
    }

    @Bean
    public OIDCProviderMetadata oidcProviderMetadata(AADAuthenticationProperties properties) {
        try {
            String issuerUrl = StringUtils.substringBefore(properties.getWellKnown(), OIDCProviderConfigurationRequest.OPENID_PROVIDER_WELL_KNOWN_PATH);
            return OIDCProviderMetadata.resolve(new Issuer(issuerUrl), 5000, 5000);
        } catch (Exception e) {
            throw new TechnicalException("io error", e);
        }
    }

    @Bean
    @SneakyThrows
    public ConfidentialClientApplication msalClient(AADAuthenticationProperties aadAuthProps, OIDCProviderMetadata oidcProviderMetadata) {
        return ConfidentialClientApplication
                .builder(aadAuthProps.getClientId(), ClientCredentialFactory.createFromSecret(aadAuthProps.getClientSecret()))
                .authority(oidcProviderMetadata.getAuthorizationEndpointURI().toString())
                .executorService(msalThreadPool())
                .build();
    }

    @Bean
    @SneakyThrows
    public PublicClientApplication msalPublicClient(AADAuthenticationProperties aadAuthProps, OIDCProviderMetadata oidcProviderMetadata) {
        return PublicClientApplication
                .builder(aadAuthProps.getClientId())
                .authority(oidcProviderMetadata.getAuthorizationEndpointURI().toString())
                .build();
    }

    @Bean
    public ThreadPoolExecutor msalThreadPool() {
        return MdcExecutor.newThreadPool(5, "msal");
    }

    @Bean
    public AppIdMapping appIdMapping(AADAuthenticationProperties properties) {
        return new AppIdMapping(properties.getAllowedAppIdMappings(), properties.getClientId());
    }
}
