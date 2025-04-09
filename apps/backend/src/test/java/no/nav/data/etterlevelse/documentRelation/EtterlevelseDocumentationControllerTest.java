package no.nav.data.etterlevelse.documentRelation;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationRequest;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationResponse;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class EtterlevelseDocumentationControllerTest extends IntegrationTestBase {

    private UUID fromId;
    private UUID toId;
    
    @BeforeEach
    void setup() {
        fromId = createEtterlevelseDokumentasjon().getId();
        toId = createEtterlevelseDokumentasjon().getId();
    }

    @Test
    void createDocumentRelationTest() {
        var req = buildDocumentRelationRequest();

        var resp = restTemplate.postForEntity("/documentrelation", req, DocumentRelationResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        DocumentRelationResponse documentRelationResponse = resp.getBody();
        assertThat(documentRelationResponse).isNotNull();

        assertThat(documentRelationResponse.getToDocument()).isNotNull();
        assertThat(documentRelationResponse.getFromDocument()).isNotNull();
        assertThat(documentRelationResponse.getRelationType()).isNotNull();
        assertThat(documentRelationResponse.getId()).isNotNull();
        assertThat(documentRelationResponse.getFromDocument()).isEqualTo(fromId);
        assertThat(documentRelationResponse.getToDocument()).isEqualTo(toId);
    }

    @Test
    void createDuplicateDocumentRelation_shouldFail() {
        var req1 = buildDocumentRelationRequest();
        var req2 = buildDocumentRelationRequest();

        restTemplate.postForEntity("/documentrelation", req1, DocumentRelationResponse.class);
        var resp = restTemplate.postForEntity("/documentrelation", req2, DocumentRelationResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void updateToDuplicateDocumentRelation_shouldFail() {
        // Create two relations...
        createDocumentRelation();
        var otherFromId = createEtterlevelseDokumentasjon().getId();
        DocumentRelation otherRel = buildDocumentRelationRequest().toDocumentRelation();
        otherRel.setFromDocument(otherFromId);
        otherRel = documentRelationService.save(otherRel, false);

        // Try to update the last one so it matches the first one...
        var updateRequest = DocumentRelationRequest.builder()
                .id(otherRel.getId())
                .fromDocument(fromId)
                .toDocument(toId)
                .relationType(RelationType.BYGGER)
                .build();
        var updateResp = restTemplate.exchange("/documentrelation/{id}", HttpMethod.PUT, new HttpEntity<>(updateRequest), DocumentRelationResponse.class, otherRel.getId());
        Assertions.assertThat(updateResp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }


    @Test
    void updateDocumentRelation() {
        var relId = createDocumentRelation().getId();
        var newToId = createEtterlevelseDokumentasjon().getId();

        var updateRequest = DocumentRelationRequest.builder()
                .id(relId)
                .fromDocument(fromId)
                .toDocument(newToId)
                .relationType(RelationType.BYGGER)
                .build();

        var updateResp = restTemplate.exchange("/documentrelation/{id}", HttpMethod.PUT, new HttpEntity<>(updateRequest), DocumentRelationResponse.class, relId);
        Assertions.assertThat(updateResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DocumentRelationResponse documentRelationResponse = updateResp.getBody();
        DocumentRelation endretDokRel = documentRelationService.getById(relId);

        assertThat(documentRelationResponse.getId()).isEqualTo(relId);
        assertThat(documentRelationResponse.getFromDocument()).isEqualTo(endretDokRel.getFromDocument()).isEqualTo(fromId);
        assertThat(documentRelationResponse.getToDocument()).isEqualTo(endretDokRel.getToDocument()).isEqualTo(newToId);
        assertThat(documentRelationResponse.getRelationType()).isEqualTo(endretDokRel.getRelationType()).isEqualTo(RelationType.BYGGER);
    }

    @Test
    void getAllDocumentRelations() {
        var otherFromId = createEtterlevelseDokumentasjon().getId();
        createDocumentRelation();
        DocumentRelation otherRel = buildDocumentRelationRequest().toDocumentRelation();
        otherRel.setFromDocument(otherFromId);
        otherRel.setRelationType(RelationType.BYGGER);
        documentRelationService.save(otherRel, false);

        var resp = restTemplate.getForEntity("/documentrelation?pageSize=1", DocumentRelationController.DocumentRelationPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DocumentRelationController.DocumentRelationPage documentRelationPage = resp.getBody();
        Assertions.assertThat(documentRelationPage).isNotNull();
        Assertions.assertThat(documentRelationPage.getNumberOfElements()).isOne();
        Assertions.assertThat(documentRelationPage.getTotalElements()).isEqualTo(2L);

        resp = restTemplate.getForEntity("/documentrelation?pageSize=2&pageNumber=1", DocumentRelationController.DocumentRelationPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        documentRelationPage = resp.getBody();
        Assertions.assertThat(documentRelationPage).isNotNull();
        Assertions.assertThat(documentRelationPage.getNumberOfElements()).isZero();
    }

    @Test
    void getDocumentRelation() {
        var documentRelation = createDocumentRelation();

        var resp = restTemplate.getForEntity("/documentrelation/{id}", DocumentRelationResponse.class, documentRelation.getId());

        Assertions.assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        Assertions.assertThat(resp.getBody().getId()).isEqualTo(documentRelation.getId());
    }

    @Test
    void deleteDocumentRelation() {
        DocumentRelation documentRelationToDelete = createDocumentRelation();
        var otherFromId = createEtterlevelseDokumentasjon().getId();
        DocumentRelation otherDocumentRelationToNotDelete = buildDocumentRelationRequest().toDocumentRelation();
        otherDocumentRelationToNotDelete.setFromDocument(otherFromId);
        documentRelationService.save(otherDocumentRelationToNotDelete, false);
        
        restTemplate.delete("/documentrelation/{id}", documentRelationToDelete.getId());

        Page<DocumentRelation> resp = documentRelationService.getAll(Pageable.ofSize(100));
        Assertions.assertThat(resp.getTotalElements()).isEqualTo(1L);
        Assertions.assertThat(resp.getContent().get(0).getId()).isEqualTo(otherDocumentRelationToNotDelete.getId());
    }

    private DocumentRelationRequest buildDocumentRelationRequest() {
        return DocumentRelationRequest.builder()
                .fromDocument(fromId)
                .toDocument(toId)
                .relationType(RelationType.ARVER)
                .update(false)
                .build();
    }

    private DocumentRelation createDocumentRelation() {
        return documentRelationService.save(buildDocumentRelationRequest().toDocumentRelation(), false);
    }

}
