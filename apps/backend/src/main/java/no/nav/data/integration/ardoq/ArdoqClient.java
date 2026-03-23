package no.nav.data.integration.ardoq;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.integration.ardoq.dto.ArdoqSystem;
import no.nav.data.integration.ardoq.dto.ArdoqSystemData;
import no.nav.data.integration.p360.dto.P360Document;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;


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
        var url = properties.getBaseUrl() + "/api/v2/reports/" + reportId + "/run/objects";

        try {
            HttpHeaders headers = createHeadersWithAuth();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            var response = restTemplate.getForEntity(url, ArdoqSystemData.class, entity);
            if (response.getBody() != null) {
                log.info("Succesfully recieve ardoq system with status code: {}", response.getStatusCode());
                return response.getBody().getValues();
            } else {
                throw new RestClientException("Response body is null");
            }
        } catch (RestClientException e) {
            log.error("Unable to connect to Ardoq, error: {}", String.valueOf(e));
            return null;
        }
    }


    private HttpHeaders createHeadersWithAuth () {
        var headers = new HttpHeaders();
        log.info("setting bearer token for ardoq");
        headers.set("Authorization", "Bearer " + properties.getBearerToken());
        return headers;
    }
}
