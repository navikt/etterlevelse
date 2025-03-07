package no.nav.data.integration.p360;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.integration.p360.dto.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static java.util.Objects.requireNonNull;

@Slf4j
@Service
@RequiredArgsConstructor
//FIXME: WIP service class needs better exception handling and async dispatch
public class P360Service {

    private final RestTemplate restTemplate;
    private final P360Properties p360Properties;

    public List<P360Case> getCasesByTitle(String title) {
        List<P360Case>  cases = List.of();
        try {
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/GetCases",
                    new HttpEntity<>( P360GetRequest.builder().title("%" + title +  "%").build(), createHeadersWithAuth()),
                    P360CasePageResponse.class);
            cases = response.hasBody() ? requireNonNull(response.getBody()).getCases() : List.of();
        } catch (RestClientException e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
        }
        return cases;
    }

    public List<P360Case> getCasesByCaseNumber(String caseNumber) {
        List<P360Case>  cases = List.of();
        try {
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/GetCases",
                    new HttpEntity<>( P360GetRequest.builder().CaseNumber(caseNumber).build(), createHeadersWithAuth()),
                    P360CasePageResponse.class);
            cases = response.hasBody() ? requireNonNull(response.getBody()).getCases() : List.of();
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
        List<P360Document>  documents = List.of();
        try {
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/GetDocuments",
                    new HttpEntity<>( P360GetRequest.builder().CaseNumber(caseNumber).build(), createHeadersWithAuth()),
                    P360DocumentPageResponse.class);
            documents = response.hasBody() ? requireNonNull(response.getBody()).getDocuments() : List.of();
        } catch (RestClientException e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
        }
        return documents;
    }

    public P360Document createDocument(P360DocumentCreateRequest request) {
        try {
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/CreateDocument",
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
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/UpdateDocument",
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

        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.set("client_id", p360Properties.getClientId());
            body.set("client_secret", p360Properties.getClientSecret());
            body.set("grant_type", "client_credentials");
            body.set("scope", p360Properties.getClientId() + "/.default");

            var response = restTemplate.postForEntity(p360Properties.getTokenUrl(), body, P360AuthToken.class);
            headers.setBearerAuth(requireNonNull(response.getBody()).getAccess_token());
            headers.set("authkey", p360Properties.getAuthKey());
            headers.set("clientid", p360Properties.getClientId());

            return headers;

        } catch (RestClientException e) {
            log.error("Unable to connect and get token, error: {}", String.valueOf(e));
            return null;
        }
    }

}
