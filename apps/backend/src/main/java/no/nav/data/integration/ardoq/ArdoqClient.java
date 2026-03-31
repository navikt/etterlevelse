package no.nav.data.integration.ardoq;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.web.TraceHeaderFilter;
import no.nav.data.integration.ardoq.dto.ArdoqSystem;
import no.nav.data.integration.ardoq.dto.ArdoqSystemData;
import no.nav.data.integration.p360.dto.P360Document;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;


@Slf4j
@Service
public class ArdoqClient {

    private final RestTemplate restTemplate;
    private final WebClient client;
    private final ArdoqProperties properties;


    public ArdoqClient(RestTemplate restTemplate, WebClient.Builder webClientBuilder, ArdoqProperties properties) {
        this.restTemplate = restTemplate;
        this.client = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .filter(new TraceHeaderFilter(true))
                .build();
        this.properties = properties;
    }

    public List<ArdoqSystem> getReport(String reportId) {
        var url = properties.getBaseUrl() + "/api/v2/reports/{id}/run/objects";

        try {
            var response = get(url, ArdoqSystemData.class, reportId);
            if (response.getValues() != null) {
                log.info("Succesfully recieve ardoq system");
                log.debug(response.getValues().toString());
                return response.getValues();
            } else {
                throw new RestClientException("Response body is null");
            }
        } catch (RestClientException e) {
            log.error("Unable to connect to Ardoq, error: {}", String.valueOf(e));
            return null;
        }
    }

    private <T> T get(String uri, Class<T> response, Object... params) {
        var res = client.get()
                .uri(uri, params)
                .header("Authorization", "Bearer " + properties.getBearerToken())
                .retrieve()
                .bodyToMono(response)
                .block();
        Assert.isTrue(res != null, "response is null");

        return res;
    }
}
