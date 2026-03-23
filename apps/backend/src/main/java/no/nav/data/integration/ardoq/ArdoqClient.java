package no.nav.data.integration.ardoq;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.integration.p360.dto.P360Document;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;


@Slf4j
@Service
public class ArdoqClient {

    private final RestTemplate restTemplate;
    private final ArdoqProperties properties;


    public ArdoqClient(RestTemplate restTemplate, ArdoqProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    public void getReport(String reportId) {
        var url = properties.getBaseUrl() + "/api/v2/reports/" + reportId + "/run/objects";

        try {
            HttpHeaders headers = createHeadersWithAuth();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            var response = restTemplate.getForEntity(url, String.class, entity);
            log.info("SUCCESS with status code: {}", response.getStatusCode());
        } catch (RestClientException e) {
            log.error("Unable to connect to Ardoq, error: {}", String.valueOf(e));
        }
    }


    private HttpHeaders createHeadersWithAuth () {
        var headers = new HttpHeaders();
        log.info("setting bearer token for ardoq");
        headers.set("Authorization", "Bearer " + properties.getBearerToken());
        return headers;
    }
}
