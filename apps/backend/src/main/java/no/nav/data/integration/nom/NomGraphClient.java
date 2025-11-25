package no.nav.data.integration.nom;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.graphql.GraphQLRequest;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.security.TokenProvider;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.integration.nom.domain.OrgEnhet;
import no.nav.data.integration.nom.domain.Organisering;
import no.nav.data.integration.nom.dto.OrgEnhetGraphqlResponse;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.common.web.TraceHeaderRequestInterceptor.correlationInterceptor;

@Slf4j
@Service
@RequiredArgsConstructor
public class NomGraphClient {

    private RestTemplate restTemplate;
    private final RestTemplateBuilder restTemplateBuilder;
    private final SecurityProperties securityProperties;
    private final TokenProvider tokenProvider;
    private final NomGraphQlProperties nomGraphQlProperties;

    private static final String getUnderOrganiseringerQuery = readCpFile("nom/graphql/queries/get_all_under_organiseringer.graphql");
    private static final String getByIdQuery = readCpFile("nom/graphql/queries/get_by_id.graphql");
    private static final String scopeTemplate = "api://%s-gcp.nom.nom-api/.default";

    private final LoadingCache<String, Map<String, OrgEnhet>> allAvdelingCache = MetricUtils
            .register("nomAvdelingCache", Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(1).build(k -> getAvdelingCache()));


    @SneakyThrows
    private static String readCpFile(String path) {
        return StreamUtils.copyToString(new ClassPathResource(path).getInputStream(), StandardCharsets.UTF_8);
    }

    private Map<String, OrgEnhet> getAvdelingCache() {
        if (securityProperties.isDev()) {
            var devAvdelinger = List.of(createDevOrganisering("avdeling_1"), createDevOrganisering("avdeling_2"));
            return safeStream(devAvdelinger)
                    .collect(Collectors.toMap(OrgEnhet::getId, Function.identity()));
        } else {
            var request = new GraphQLRequest(getUnderOrganiseringerQuery, Map.of("id", "bu431e"));
            var res = template().postForEntity(nomGraphQlProperties.getUrl(), request, OrgEnhetGraphqlResponse.class);

            assert res.getBody() != null;
            assert res.getBody().getData() != null;

            var response = res.getBody().getData();

            if (response.getOrgEnhet() == null) {
                return new HashMap<>();
            }

            var alleAvdelinger = response.getOrgEnhet().getOrganiseringer().stream().map(Organisering::getOrgEnhet).toList();

            return safeStream(alleAvdelinger)
                    .collect(Collectors.toMap(OrgEnhet::getId, Function.identity()));
        }
    }

    public List<OrgEnhet> getAllSeksjonForAvdeling(String avdelingId) {
        var avdeling = getAvdelingById(avdelingId);
        if (avdeling.isEmpty()) {
            throw new ValidationException("Invalid avdeling id: " + avdelingId);
        } else {
            if (securityProperties.isDev()) {
                return List.of(
                        createDevOrganisering("seksjon_1"),
                        createDevOrganisering("seksjon_2"),
                        createDevOrganisering("seksjon_3"),
                        createDevOrganisering("seksjon_4"),
                        createDevOrganisering("seksjon_5"),
                        createDevOrganisering("seksjon_6"),
                        createDevOrganisering("seksjon_7"),
                        createDevOrganisering("seksjon_8"),
                        createDevOrganisering("seksjon_9")
                );
            } else {
                var request = new GraphQLRequest(getUnderOrganiseringerQuery, Map.of("id", avdelingId));
                var res = template().postForEntity(nomGraphQlProperties.getUrl(), request, OrgEnhetGraphqlResponse.class);

                assert res.getBody() != null;
                assert res.getBody().getData() != null;

                var response = res.getBody().getData();

                if (response.getOrgEnhet() == null) {
                    return List.of();
                }

                return response.getOrgEnhet().getOrganiseringer().stream().map(Organisering::getOrgEnhet).toList();

            }
        }
    }

    private Map<String, OrgEnhet> getAvdelingerFromCache() {
        return allAvdelingCache.get("singleton");
    }

    public List<OrgEnhet> getAllAvdelinger() {
        return new ArrayList<>(getAvdelingerFromCache().values());
    }

    public Optional<OrgEnhet> getAvdelingById(String id) {
        return Optional.ofNullable(getAvdelingCache().get(id));
    }


    public OrgEnhet getById(String id) {
        var request = new GraphQLRequest(getByIdQuery, Map.of("id", id));
        var res = template().postForEntity(nomGraphQlProperties.getUrl(), request, OrgEnhetGraphqlResponse.class);
        assert res.getBody() != null;
        return res.getBody().getData().getOrgEnhet();
    }

    private RestOperations template() {
        if (restTemplate == null) {
            restTemplate = restTemplateBuilder
                    .additionalInterceptors(correlationInterceptor(), tokenInterceptor())
                    .messageConverters(new MappingJackson2HttpMessageConverter())
                    .build();
        }
        return restTemplate;
    }


    @SneakyThrows
    private ClientHttpRequestInterceptor tokenInterceptor() {
        return (request, body, execution) -> {
            String token = tokenProvider.getConsumerToken(getScope());
            log.debug("tokenInterceptor adding token: %s... for scope '%s'".formatted((token != null && token.length() > 12 ? token.substring(0, 11) : token), getScope()));
            request.getHeaders().add(HttpHeaders.AUTHORIZATION, token);
            return execution.execute(request, body);
        };
    }

    private String getScope() {
        return scopeTemplate.formatted(securityProperties.isDev() ? "dev" : "prod");
    }

    private OrgEnhet createDevOrganisering(String id) {
        return OrgEnhet.builder().id(id).navn(id).build();
    }
}
