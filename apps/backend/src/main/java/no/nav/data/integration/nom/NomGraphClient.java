package no.nav.data.integration.nom;

import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.common.web.TraceHeaderRequestInterceptor.correlationInterceptor;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

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
            var devAvdelinger = List.of(
                    createDevOrganisering("arbeidsavdelingen", "Arbeidsavdelingen"),
                    createDevOrganisering("arbeids_og_velferdsdirektor", "Arbeids- og velferdsdirektør"),
                    createDevOrganisering("brukeropplevelser", "Avdeling for brukeropplevelser"),
                    createDevOrganisering("mennesker_og_organisasjon", "Avdeling for mennesker og organisasjon"),
                    createDevOrganisering("internrevisjon", "Internrevisjon"),
                    createDevOrganisering("juridisk_avdeling", "Juridisk avdeling"),
                    createDevOrganisering("klageinstans", "Klageinstans"),
                    createDevOrganisering("kommunikasjonsavdelingen", "Kommunikasjonsavdelingen"),
                    createDevOrganisering("kunnskapsavdelingen", "Kunnskapsavdelingen"),
                    createDevOrganisering("sekretariatet", "Sekretariatet"),
                    createDevOrganisering("teknologiavdelingen", "Teknologiavdelingen"),
                    createDevOrganisering("velferdsavdelingen", "Velferdsavdelingen"),
                    createDevOrganisering("ytelsesavdelingen", "Ytelsesavdelingen"),
                    createDevOrganisering("okonomi_og_styringsavdelingen", "Økonomi- og styringsavdelingen")
            );
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
                return getDevSeksjoner(avdelingId);
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

    private OrgEnhet createDevOrganisering(String id, String navn) {
        return OrgEnhet.builder().id(id).navn(navn).build();
    }

    private List<OrgEnhet> getDevSeksjoner(String avdelingId) {
        return switch (avdelingId) {
            case "arbeidsavdelingen" -> List.of(
                    createDevOrganisering("arb_sek_1", "Seksjon for arbeid og helse"),
                    createDevOrganisering("arb_sek_2", "Seksjon for arbeidsgivertjenester"),
                    createDevOrganisering("arb_sek_3", "Seksjon for arbeidsmarkedstiltak"),
                    createDevOrganisering("arb_sek_4", "Seksjon for arbeidsoppfølging"),
                    createDevOrganisering("arb_sek_5", "Styringsseksjon for Arbeidsavdelingen")
            );
            case "brukeropplevelser" -> List.of(
                    createDevOrganisering("bru_sek_1", "Designseksjonen"),
                    createDevOrganisering("bru_sek_2", "Seksjon for brukerflater"),
                    createDevOrganisering("bru_sek_3", "Seksjon for brukerinnsikt")
            );
            case "mennesker_og_organisasjon" -> List.of(
                    createDevOrganisering("mo_sek_1", "Arbeidsgiverseksjonen"),
                    createDevOrganisering("mo_sek_2", "Avdeling for mennesker og organisasjon"),
                    createDevOrganisering("mo_sek_3", "HMS- og styringsseksjonen"),
                    createDevOrganisering("mo_sek_4", "Seksjon for kompetanseutvikling"),
                    createDevOrganisering("mo_sek_5", "Seksjon for leder- og teamutvikling")
            );
            case "juridisk_avdeling" -> List.of(
                    createDevOrganisering("jur_sek_1", "Seksjon for personvern og forvaltningsrett"),
                    createDevOrganisering("jur_sek_2", "Seksjon for rettsavklaring"),
                    createDevOrganisering("jur_sek_3", "Styringsseksjon for Juridisk avdeling")
            );
            case "klageinstans" -> List.of(
                    createDevOrganisering("kla_sek_1", "Klageinstans Bergen"),
                    createDevOrganisering("kla_sek_2", "Klageinstans Kristiansand"),
                    createDevOrganisering("kla_sek_3", "Klageinstans Oslo"),
                    createDevOrganisering("kla_sek_4", "Klageinstans styringsenhet"),
                    createDevOrganisering("kla_sek_5", "Klageinstans Tromsø"),
                    createDevOrganisering("kla_sek_6", "Klageinstans Trondheim"),
                    createDevOrganisering("kla_sek_7", "Klageinstans Tønsberg")
            );
            case "kommunikasjonsavdelingen" -> List.of(
                    createDevOrganisering("kom_sek_1", "Seksjon for endringskommunikasjon"),
                    createDevOrganisering("kom_sek_2", "Seksjon for identitet og formidling"),
                    createDevOrganisering("kom_sek_3", "Seksjon for samfunnskontakt"),
                    createDevOrganisering("kom_sek_4", "Seksjon for virksomhetskommunikasjon")
            );
            case "kunnskapsavdelingen" -> List.of(
                    createDevOrganisering("kun_sek_1", "Forskningsseksjonen"),
                    createDevOrganisering("kun_sek_2", "FOU-seksjonen"),
                    createDevOrganisering("kun_sek_3", "Prognoseseksjonen"),
                    createDevOrganisering("kun_sek_4", "Seksjon for kunnskapsbasert læring"),
                    createDevOrganisering("kun_sek_5", "Statistikkseksjonen"),
                    createDevOrganisering("kun_sek_6", "Styringsseksjon for Kunnskapsavdelingen")
            );
            case "teknologiavdelingen" -> List.of(
                    createDevOrganisering("tek_sek_1", "Data og informasjonsforvaltning"),
                    createDevOrganisering("tek_sek_2", "Digital ansattopplevelse"),
                    createDevOrganisering("tek_sek_3", "Digital sikkerhet"),
                    createDevOrganisering("tek_sek_4", "Organisasjon og styring"),
                    createDevOrganisering("tek_sek_5", "Plattform og infrastruktur"),
                    createDevOrganisering("tek_sek_6", "Produktutvikling"),
                    createDevOrganisering("tek_sek_7", "Utvikling")
            );
            case "velferdsavdelingen" -> List.of(
                    createDevOrganisering("vel_sek_1", "Seksjon for hjelpemidler og tilrettelegging"),
                    createDevOrganisering("vel_sek_2", "Seksjon for sosiale tjenester"),
                    createDevOrganisering("vel_sek_3", "Styringsseksjon for Velferdsavdelingen")
            );
            case "ytelsesavdelingen" -> List.of(
                    createDevOrganisering("yt_sek_1", "Seksjon for arbeidsavklaringspenger"),
                    createDevOrganisering("yt_sek_2", "Seksjon for arbeidsytelser"),
                    createDevOrganisering("yt_sek_3", "Seksjon for familieytelser"),
                    createDevOrganisering("yt_sek_4", "Seksjon for helseytelser"),
                    createDevOrganisering("yt_sek_5", "Seksjon for kontroll og internasjonalt"),
                    createDevOrganisering("yt_sek_6", "Seksjon for pensjon og uføretrygd"),
                    createDevOrganisering("yt_sek_7", "Styringsseksjon for Ytelsesavdelingen")
            );
            default -> List.of();
        };
    }
}
