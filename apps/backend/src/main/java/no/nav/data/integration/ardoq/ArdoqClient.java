package no.nav.data.integration.ardoq;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.integration.ardoq.dto.ArdoqSystem;
import no.nav.data.integration.ardoq.dto.ArdoqSystemData;
import no.nav.data.integration.ardoq.dto.ArdoqSystemResponse;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.teamcat.TeamKatTeam;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.utils.StreamUtils.safeStream;


@Slf4j
@Service
public class ArdoqClient {

    private final RestTemplate restTemplate;
    private final ArdoqProperties properties;

    private final LoadingCache<String, Map<String, ArdoqSystemResponse>> allArdoqSystem;


    public ArdoqClient(RestTemplate restTemplate, ArdoqProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;

        this.allArdoqSystem = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(1).build(k -> getArdoqSystemsResponse());
        MetricUtils.register("ardoqSystemCache", allArdoqSystem);
    }

    public List<ArdoqSystemResponse> getAllArdoqSystems() {
        ArrayList<ArdoqSystemResponse> systems = new ArrayList<>(getArdoqSystems().values());
        systems.sort(Comparator.comparing(ArdoqSystemResponse::getNavn));
        return systems;
    }

    public Optional<ArdoqSystemResponse> getArdoqSystemById(String ardoqSystemId) {
        return Optional.ofNullable(getArdoqSystems().get(ardoqSystemId));
    }

    private Map<String, ArdoqSystemResponse> getArdoqSystems() {
        return allArdoqSystem.get("singleton");
    }


    private Map<String, ArdoqSystemResponse> getArdoqSystemsResponse() {
        List<ArdoqSystemResponse> ardoqSystems = List.of();
        try {
            var url = properties.getBaseUrl() + "/api/v2/reports/{id}/run/objects";

            ResponseEntity<ArdoqSystemData> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(createHeadersWithAuth()),
                    ArdoqSystemData.class,
                    properties.getReportId()
            );
            ArdoqSystemData body = response.getBody();
            if (body == null || body.getValues() == null) {
                throw new RestClientException("Response body is null");
            } else {
                log.info("Succesfully recieve ardoq system");
                ardoqSystems = body.getValues().stream().map(ArdoqSystem::convertToResponse).toList();
            }
        } catch (RestClientException e) {
            log.error("Unable to connect to Ardoq, error: {}", String.valueOf(e));
        }

        return safeStream(ardoqSystems)
                .collect(Collectors.toMap(ArdoqSystemResponse::getArdoqID, Function.identity()));
    }

    private HttpHeaders createHeadersWithAuth () {
        var headers = new HttpHeaders();
        log.info("setting bearer token for ardoq");

        String token = Optional.ofNullable(properties.getBearerToken())
                .orElse("")
                .replaceAll("[\\r\\n\\t]", "")
                .trim();

        headers.setBearerAuth(token);
        return headers;
    }

}
