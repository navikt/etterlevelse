package no.nav.data.etterlevelse.documentRelation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationRequest;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/documentrelation")
@Tag(name = "Document Relation", description = "Relation between etterlevelse document")
@RequiredArgsConstructor
public class DocumentRelationController {

    private final DocumentRelationService service;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;


    @Operation(summary = "Get All Document relation")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<DocumentRelationResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all Document relation");
        Page<DocumentRelation> page = service.getAll(pageParameters.createPage());
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(DocumentRelationResponse::buildFrom));
    }

    @Operation(summary = "Get One Document relation")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<DocumentRelationResponse> getById(@PathVariable UUID id, @RequestParam(required = false) boolean withDocumentData) {
        log.info("Get Document relation id={}", id);
        DocumentRelationResponse documentRelation = DocumentRelationResponse.buildFrom(service.getById(id));
        if (withDocumentData) {
            var fromEtterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelation.getFromDocument()));
            var toEtterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelation.getToDocument()));
            documentRelation.setFromDocumentWithData(EtterlevelseDokumentasjonResponse.buildFrom(fromEtterlevelseDokumentasjon));
            documentRelation.setToDocumentWithData(EtterlevelseDokumentasjonResponse.buildFrom(toEtterlevelseDokumentasjon));
        }

        return ResponseEntity.ok(documentRelation);
    }

    @Operation(summary = "Get Document relation by from id")
    @ApiResponse(description = "ok")
    @GetMapping("/fromdocument/{id}")
    public ResponseEntity<List<DocumentRelationResponse>> getByFromDocumentId(
            @PathVariable UUID id, 
            @RequestParam(required = false) RelationType relationType, 
            @RequestParam(required = false) boolean withDocumentData
    ) {
        log.info("Get Document relation by from id={}", id);
        List<DocumentRelationResponse> documentRelationList;
        if (relationType != null) {
             documentRelationList = service.findByFromDocumentAndRelationType(id.toString(), relationType).stream().map(DocumentRelationResponse::buildFrom).toList();
        } else {
            documentRelationList = service.findByFromDocument(id.toString()).stream().map(DocumentRelationResponse::buildFrom).toList();
        }

        if (withDocumentData) {
            documentRelationList.forEach((documentRelationResponse) -> {
                var toEtterlevelsesDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelationResponse.getToDocument()));
                documentRelationResponse.setToDocumentWithData(EtterlevelseDokumentasjonResponse.buildFrom(toEtterlevelsesDokumentasjon));
            });
        }

        return ResponseEntity.ok(documentRelationList);
    }

    @Operation(summary = "Get Document relation by to id")
    @ApiResponse(description = "ok")
    @GetMapping("/todocument/{id}")
    public ResponseEntity<List<DocumentRelationResponse>> getByToDocumentId(
            @PathVariable UUID id, 
            @RequestParam(required = false) RelationType relationType, 
            @RequestParam(required = false) boolean withDocumentData
    ) {
        log.info("Get Document relation by to id={}", id);
        List<DocumentRelationResponse> documentRelationList;
        if (relationType != null) {
            documentRelationList = service.findByToDocumentAndRelationType(id.toString(), relationType).stream().map(DocumentRelationResponse::buildFrom).toList();
        } else {
            documentRelationList = service.findByToDocument(id.toString()).stream().map(DocumentRelationResponse::buildFrom).toList();
        }

        if (withDocumentData) {
            documentRelationList.forEach((documentRelationResponse) -> {
                var fromEtterlevelsesDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelationResponse.getFromDocument()));
                documentRelationResponse.setFromDocumentWithData(EtterlevelseDokumentasjonResponse.buildFrom(fromEtterlevelsesDokumentasjon));
            });
        }

        return ResponseEntity.ok(documentRelationList);
    }

    @Operation(summary = "Create Document relation")
    @ApiResponse(responseCode = "201", description = "Document relation created")
    @PostMapping
    public ResponseEntity<DocumentRelationResponse> createDocumentRelation(@RequestBody DocumentRelationRequest request) {
        log.info("Create Document relation");

        var existingDocumentRelation = service.findByFromDocumentAndToDocumentAndRelationType(request.getFromDocument(), request.getToDocument(), request.getRelationType());

        if (existingDocumentRelation != null) {
            throw new ValidationException("Document relation already exist");
        }
        
        var documentRelation = request.toDocumentRelation();
        documentRelation.setId(UUID.randomUUID());
        documentRelation = service.save(documentRelation, request.isUpdate());

        return new ResponseEntity<>(DocumentRelationResponse.buildFrom(documentRelation), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Document relation")
    @ApiResponse(description = "Document relation updated")
    @PutMapping("/{id}")
    public ResponseEntity<DocumentRelationResponse> updateDocumentRelation(@PathVariable UUID id, @Valid @RequestBody DocumentRelationRequest request) {
        log.debug("Update Document relation id={}", id);
        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        
        var documentRelation = request.toDocumentRelation();
        documentRelation.setId(id);
        documentRelation = service.save(documentRelation, request.isUpdate());
        return ResponseEntity.ok(DocumentRelationResponse.buildFrom(documentRelation));
    }

    @Operation(summary = "Delete Document relation")
    @ApiResponse(description = "Document relation deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<DocumentRelationResponse> deleteDocumentRelationById(@PathVariable UUID id) {
        log.info("Delete Document relation id={}", id);
        var deletedDocumentRelation = service.deleteById(id);
        return ResponseEntity.ok(DocumentRelationResponse.buildFrom(deletedDocumentRelation));
    }

    static class DocumentRelationPage extends RestResponsePage<DocumentRelationResponse> {
    }
}
