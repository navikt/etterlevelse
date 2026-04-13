package no.nav.data.integration.p360;

import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.export.EtterlevelseDokumentasjonToDoc;
import no.nav.data.integration.p360.domain.P360ArchiveDocument;
import no.nav.data.integration.p360.dto.P360Case;
import no.nav.data.integration.p360.dto.P360Document;
import no.nav.data.integration.p360.dto.P360DocumentRequest;
import no.nav.data.integration.p360.dto.P360DocumentUpdateRequest;
import no.nav.data.integration.p360.dto.P360File;
import no.nav.data.integration.p360.dto.P360GetRequest;

@Slf4j
@RestController
@Tag(name = "Public 360", description = "Public 360 for arkivering")
@RequestMapping("/p360")
@RequiredArgsConstructor
public class P360Controller {

    private final P360Service p360Service;
    private final P360ArkiveringService p360ArkiveringService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;

    @Operation(summary = "Get all p360 archive document")
    @ApiResponses(value = {@ApiResponse(description = "Cases fetched")})
    @GetMapping("/getP360ArchiveDocuments")
    public ResponseEntity<RestResponsePage<P360ArchiveDocument>> getP360ArchiveDocuments(PageParameters pageParameters) {
        log.info("Get all p360 archive documents");
        Page<P360ArchiveDocument> p360ArchiveDocuments = p360Service.getAllPageP360ArchiveDocuments(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(p360ArchiveDocuments));
    }

    @Operation(summary = "Arkiver dokumeter")
    @ApiResponses(value = {@ApiResponse(description = "Cases fetched")})
    @PostMapping("/arkiver")
    public ResponseEntity<EtterlevelseDokumentasjonResponse> archiveDocument(@RequestParam(name = "etterlevelseDokumentasjonId", required = false) UUID etterlevelseDokumentasjonId,
                                                                             @RequestParam(name = "onlyActiveKrav", required = false) boolean onlyActiveKrav,
                                                                             @RequestParam(name = "pvoTilbakemelding", required = false) boolean pvoTilbakemelding,
                                                                             @RequestParam(name = "risikoeier", required = false) boolean risikoeier,
                                                                             @RequestParam(name = "godkjenning", required = false) boolean godkjenning) {
        log.info("Archiving etterlevelse dokumentasjon with id {}", etterlevelseDokumentasjonId);
        var eDok = etterlevelseDokumentasjonService.get(etterlevelseDokumentasjonId);

        try {
            p360ArkiveringService.archive(eDok.getId(), onlyActiveKrav, pvoTilbakemelding, risikoeier, godkjenning);
            return ResponseEntity.ok(EtterlevelseDokumentasjonResponse.buildFrom(eDok));
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get Cases")
    @ApiResponses(value = {@ApiResponse(description = "Cases fetched")})
    @PostMapping("/getCases")
    public ResponseEntity<RestResponsePage<P360Case>> findCases(@RequestBody P360GetRequest request) {
        log.info("Finding all cases by title or case number");
        if (request.getCaseNumber() != null) {
            return ResponseEntity.ok(new RestResponsePage<>(p360Service.getCasesByCaseNumber(request.getCaseNumber())));
        } else {
            return ResponseEntity.ok(new RestResponsePage<>(p360Service.getCasesByTitle(request.getTitle())));
        }
    }

    @Operation(summary = "Get Documents")
    @ApiResponses(value = {@ApiResponse(description = "Documents fetched")})
    @PostMapping("/getDocuments")
    public ResponseEntity<RestResponsePage<P360Document>> findDocuments(@RequestBody P360GetRequest request) {
        log.info("Finding all documents by case number");
        List<P360Document> documents = p360Service.getDocumentByCaseNumber(request.getCaseNumber());
        return ResponseEntity.ok(new RestResponsePage<>(documents));
    }


    @Operation(summary = "Update Document")
    @ApiResponses(value = {@ApiResponse(description = "Cases updated")})
    @PostMapping("/update/documentCases/etterlevelseDokumentasjon/{id}")
    public ResponseEntity<P360Document> updateDocument(@PathVariable String id, @RequestBody P360DocumentRequest request) {
        log.info("Creating document for dokument: {}", request.getDocumentNumber());
        if (request.getDocumentNumber() == null || request.getDocumentNumber().isEmpty()) {
            throw new ValidationException("Cannot create document because document number is empty");
        }
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd");
        Date date = new Date();

        var etterlevelsedokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(id));
        byte[] wordFile = etterlevelseDokumentasjonToDoc.generateDocFor(etterlevelsedokumentasjon.getId(), Collections.emptyList(), Collections.emptyList(), true, true);

        P360Document document = p360Service.updateDocument(P360DocumentUpdateRequest.builder()
                .DocumentNumber(request.getDocumentNumber())
                .Title("E" + etterlevelsedokumentasjon.getEtterlevelseNummer() + " test dokument")
                .DocumentDate(formatter.format(date))
                .ResponsiblePersonIdNumber(SecurityUtils.getCurrentIdent())
                .Files(List.of(P360File.builder()
                        .Title(formatter.format(date) + "_Etterlevelse_E" + etterlevelsedokumentasjon.getEtterlevelseNummer())
                        .Format("docx")
                        .Base64Data(Base64.getEncoder().encodeToString(wordFile))
                        .build()))
                .build());
        return ResponseEntity.ok(document);
    }
}