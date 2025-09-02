package no.nav.data.integration.p360;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.etterlevelse.varsel.VarselService;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.p360.domain.P360ArchiveDocument;
import no.nav.data.integration.p360.domain.P360ArchiveDocumentRepo;
import no.nav.data.integration.p360.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.utils.Constants.PUBLIC_360_AUTHKEY;
import static no.nav.data.common.utils.Constants.PUBLIC_360_CLIENTID;

@Slf4j
@Service
@AllArgsConstructor
//FIXME: WIP service class needs better exception handling and async dispatch
public class P360Service {

    private final RestTemplate restTemplate;
    private final P360Properties p360Properties;
    private final P360ArchiveDocumentRepo p360ArchiveDocumentRepo;
    private final VarselService varselService;
    private final SecurityProperties securityProperties;

    @Autowired
    private Environment env;

    public P360ArchiveDocument get(UUID uuid) {
        return p360ArchiveDocumentRepo.findById(uuid).orElse(null);
    }

    public List<P360ArchiveDocument> getAllP360ArchiveDocuments() {
        return p360ArchiveDocumentRepo.findAll();
    }

    public Page<P360ArchiveDocument> getAllPageP360ArchiveDocuments(PageParameters pageParameters) {
        return p360ArchiveDocumentRepo.findAll(pageParameters.createPage());
    }

    public List<P360Case> getCasesByTitle(String title) {
        List<P360Case> cases = new ArrayList<>();
        try {
            log.info("Forwarding request to P360");
            var response = restTemplate.postForEntity(p360Properties.getCaseUrl() + "/GetCases",
                    new HttpEntity<>( P360GetRequest.builder().Title("%" + title +  "%").build(), createHeadersWithAuth()),
                    P360CasePageResponse.class);

            if(response.getBody() != null) {
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

            assert response.getBody() != null;
            if (!response.getBody().getErrorMessage().isEmpty()) {
                throw new RestClientException(response.getBody().getErrorMessage());
            }

            return response.getBody();
        } catch (Exception e) {
            log.error("Unable to connect to P360, error: {}", String.valueOf(e));
            errorVarsling("Feil ved oppretting av sakNummer i P360 for " + request.getTitle(), String.valueOf(e) );
            throw new RestClientException(e.getMessage());
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
            assert response.getBody() != null;
            if(response.getBody().getErrorMessage() != null && !response.getBody().getErrorMessage().isEmpty()) {
                throw new RestClientException(response.getBody().getErrorMessage());
            }
            return response.getBody();
        } catch (Exception e) {
            log.error("Unable to connect to P360, error: {} \n stack: {}", e.getMessage(), Arrays.toString(e.getStackTrace()));
            errorVarsling("Feil ved oppretting av document i P360 for " + request.getTitle(), String.valueOf(e) + " stack trace: "  + Arrays.toString(e.getStackTrace()));
            throw new RestClientException(e.getMessage());
        }
    }

    private void errorVarsling (String title, String melding) {
        String channelToRecieve = securityProperties.isDev() ? env.getProperty("client.devmail.slack-channel-id") : env.getProperty("client.prodmail.slack-channel-id");

        var varselBuilder = Varsel.builder()
                .title(title)
                .paragraph(new Varsel.Paragraph(melding))
                .build();

        varselService.varsle(List.of(Varslingsadresse.builder()
                .type(AdresseType.SLACK)
                .adresse(channelToRecieve)
                .build()), varselBuilder);
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
            //cleaning up key values for some wierd reason a \n is being added to the keys
            headers.set(PUBLIC_360_AUTHKEY, p360Properties.getAuthKey().replaceAll("[\\r\\n\\t]", "").trim());
            headers.set(PUBLIC_360_CLIENTID, p360Properties.getClientId().replaceAll("[\\r\\n\\t]", "").trim());

            log.info("successfully created auth headers for p360");
            return headers;

        } catch (RestClientException e) {
            log.error("Unable to connect and get token, error: {}", String.valueOf(e));
            return null;
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public P360ArchiveDocument save(P360DocumentCreateRequest request) {
        var p360ArchiveDocument = new P360ArchiveDocument();
        p360ArchiveDocument.setData(request);
        return p360ArchiveDocumentRepo.save(p360ArchiveDocument);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public P360ArchiveDocument delete(UUID id) {
        var p360ArchiveDocument = get(id);
        p360ArchiveDocumentRepo.deleteById(id);
        return p360ArchiveDocument;
    }



    // trenger en scheduler som henter fra tabell og publiserer til websak

}
