package no.nav.data.integration.ardoq;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.integration.ardoq.dto.ArdoqSystem;
import no.nav.data.integration.ardoq.dto.ArdoqSystemData;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;


@Slf4j
@Service
public class ArdoqClient {

    private final RestTemplate restTemplate;
    private final ArdoqProperties properties;


    public ArdoqClient(RestTemplate restTemplate, ArdoqProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    public List<ArdoqSystem> getReport(String reportId) {
        var url = properties.getBaseUrl() + "/api/v2/reports/{id}/run/objects";

        try {
            ResponseEntity<ArdoqSystemData> response = restTemplate.exchange(
               url,
               HttpMethod.GET,
               new HttpEntity<>(createHeadersWithAuth()),
                    ArdoqSystemData.class,
                    reportId
            );
            ArdoqSystemData body = response.getBody();
            if (body == null || body.getValues() == null) {
                throw new RestClientException("Response body is null");
            } else {
                log.info("Succesfully recieve ardoq system");
                log.debug(response.getBody().getValues().toString());
                return body.getValues();
            }
        } catch (RestClientException e) {
            log.error("Unable to connect to Ardoq, error: {}", String.valueOf(e));
            return null;
        }
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
