package no.nav.data.integration.p360;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.web.TraceHeaderRequestInterceptor;
import no.nav.data.integration.p360.dto.*;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

import static java.util.Objects.requireNonNull;

@Slf4j
@Service
//FIXME: WIP service class needs better exception handling and async dispatch
public class P360Service {

    private final RestTemplate restTemplate;
    private final P360Properties p360Properties;

    public P360Service(P360Properties p360Properties, RestTemplateBuilder restTemplateBuilder) {
        this.p360Properties = p360Properties;
        this.restTemplate = restTemplateBuilder
                .additionalInterceptors(TraceHeaderRequestInterceptor.correlationInterceptor())
                .defaultHeader("authkey", p360Properties.getAuthKey())
                .defaultHeader("clientid", p360Properties.getClientId())
                .build();
    }

    public List<P360Case> getCasesByTitle(String title) {
        List<P360Case> cases = new ArrayList<>();
        try {
            log.info("Forwarding request to P360");
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/GetCases",
                    new HttpEntity<>( P360GetRequest.builder().Title("%" + title +  "%").build(), createHeadersWithAuth()),
                    P360CasePageResponse.class);
            log.debug(response.getStatusCode().toString());
            log.debug(response.toString());

            if (response.getBody() != null) {
                log.info("Succesfully sent request to P360");
                cases.addAll(response.getBody().getCases());
                if(response.getBody().getErrorMessage() != null) {
                    log.error(response.getBody().getErrorMessage());
                }
            }

        } catch (RestClientException e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
        }
        return cases;
    }

    public List<P360Case> getCasesByCaseNumber(String caseNumber) {
        List<P360Case> cases = new ArrayList<>();
        try {
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/GetCases",
                    new HttpEntity<>( P360GetRequest.builder().CaseNumber(caseNumber).build(), createHeadersWithAuth()),
                    P360CasePageResponse.class);
            if (response.getBody() != null) {
                cases.addAll(response.getBody().getCases());
                if(response.getBody().getErrorMessage() != null) {
                    log.error(response.getBody().getErrorMessage());
                }
            }
        } catch (RestClientException e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
        }
        return cases;
    }

    public P360Case createCase(P360CaseRequest request) {
        try {
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/CreateCase",
                    new HttpEntity<>( request, createHeadersWithAuth()),
                    P360Case.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
            return null;
        }
    }

    public List<P360Document> getDocumentByCaseNumber(String caseNumber) {
        List<P360Document> documents = new ArrayList<>();
        try {
            var response = restTemplate.postForEntity(p360Properties.getDocumentUrl() + "/GetDocuments",
                    new HttpEntity<>( P360GetRequest.builder().CaseNumber(caseNumber).build(), createHeadersWithAuth()),
                    P360DocumentPageResponse.class);

            if (response.hasBody()) {
                documents = requireNonNull(response.getBody()).getDocuments();
            }
        } catch (RestClientException e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
        }
        return documents;
    }

    public P360Document createDocument(P360DocumentCreateRequest request) {
        try {
            var response = restTemplate.postForEntity(p360Properties.getDocumentUrl() + "/CreateDocument",
                    new HttpEntity<>(request, createHeadersWithAuth()),
                    P360Document.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
            return null;
        }
    }

    public P360Document updateDocument(P360DocumentUpdateRequest request) {
        try {
            var response = restTemplate.postForEntity(p360Properties.getDocumentUrl() + "/UpdateDocument",
                    new HttpEntity<>(request, createHeadersWithAuth()),
                    P360Document.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
            return null;
        }
    }

    private HttpHeaders createHeadersWithAuth () {
        var headers = new HttpHeaders();
        log.info("getting auth headers for p360");

        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.set("client_id", p360Properties.getClientId());
            body.set("client_secret", p360Properties.getClientSecret());
            body.set("grant_type", "client_credentials");
            body.set("scope", p360Properties.getClientId() + "/.default");

            var response = restTemplate.postForEntity(p360Properties.getTokenUrl(), body, P360AuthToken.class);
            headers.setBearerAuth(requireNonNull(response.getBody()).getAccess_token());
            headers.setContentType(MediaType.APPLICATION_JSON);


            log.info("successfully created auth headers for p360");
            return headers;

        } catch (RestClientException e) {
            log.error("Unable to connect and get token, error: {}", String.valueOf(e));
            return null;
        }
    }

}
