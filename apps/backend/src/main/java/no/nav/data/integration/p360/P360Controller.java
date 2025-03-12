package no.nav.data.integration.p360;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivToDocService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.export.EtterlevelseDokumentasjonToDoc;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.behandling.dto.DataBehandler;
import no.nav.data.integration.p360.dto.*;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

import static java.util.stream.Collectors.toList;

@Slf4j
@RestController
@Tag(name = "Public 360", description = "Public 360 for arkivering")
@RequestMapping("/p360")
@RequiredArgsConstructor
public class P360Controller {

    private final P360Service p360Service;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;

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

    @Operation(summary = "Create Case")
    @ApiResponses(value = {@ApiResponse(description = "Cases created")})
    @PostMapping("/createCases/etterlevelseDokumentasjon/{id}")
    public ResponseEntity<P360Case> createCase(@PathVariable String id) {
        log.info("Creating case with etterlevelse dokumentasjon id: {}", id);

        var etterlevelsedokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(id));

        P360Case sak = p360Service.createCase(P360CaseRequest.builder()
                        .CaseType("Sak")
                        .DefaultValueSet("Etterlevelse")
                        .Title("E" + etterlevelsedokumentasjon.getEtterlevelseNummer() + " " + etterlevelsedokumentasjon.getTitle())
                        .Status("B")
                        .AccessCode("U")
                        .AccessGroup("Alle ansatte i Nav")
                        .ResponsiblePersonEmail(SecurityUtils.getCurrentEmail())
                .build());
        return ResponseEntity.ok(sak);
    }

    @Operation(summary = "Get Documents")
    @ApiResponses(value = {@ApiResponse(description = "Documents fetched")})
    @PostMapping("/getDocuments")
    public ResponseEntity<RestResponsePage<P360Document>> findDocuments(@RequestBody P360GetRequest request) {
        log.info("Finding all documents by case number");
        List<P360Document> documents = p360Service.getDocumentByCaseNumber(request.getCaseNumber());
        return ResponseEntity.ok(new RestResponsePage<>(documents));
    }

    @Operation(summary = "Create Document")
    @ApiResponses(value = {@ApiResponse(description = "Cases created")})
    @PostMapping("/create/documentCases/etterlevelseDokumentasjon/{id}")
    public ResponseEntity<P360Document> createDocument(@PathVariable String id, @RequestBody String caseNumber) {
        log.info("Creating document for sak: {}", caseNumber);

        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd");
        Date date = new Date();

        var etterlevelsedokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(id));
        byte[] wordFile = etterlevelseDokumentasjonToDoc.generateDocFor(etterlevelsedokumentasjon.getId(), Collections.emptyList(), Collections.emptyList(), true);

        P360Document document = p360Service.createDocument(P360DocumentCreateRequest.builder()
                        .CaseNumber(caseNumber)
                        .Archive("Saksdokument")
                        .DefaultValueSet("Etterlevelse")
                        .Title("E" + etterlevelsedokumentasjon.getEtterlevelseNummer() + " test dokument")
                        .DocumentDate(formatter.format(date))
                        .Category("Internt notat uten oppfølging")
                        .Status("J")
                        .AccessGroup("Alle ansatte i Nav")
                        .ResponsiblePersonEmail(SecurityUtils.getCurrentEmail())
                        .Files(List.of(P360File.builder()
                                        .Title(formatter.format(date) + "_Etterlevelse_E" + etterlevelsedokumentasjon.getEtterlevelseNummer())
                                        .Format("docx")
                                        .Base64Data(Base64.getEncoder().encodeToString(wordFile))
                                .build()))
                .build());
        return ResponseEntity.ok(document);
    }


    @Operation(summary = "Update Document")
    @ApiResponses(value = {@ApiResponse(description = "Cases updated")})
    @PostMapping("/update/documentCases/etterlevelseDokumentasjon/{id}")
    public ResponseEntity<P360Document> updateDocument(@PathVariable String id, @RequestBody String dokumentNummber) {
        log.info("Creating document for dokument: {}", dokumentNummber);

        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd");
        Date date = new Date();

        var etterlevelsedokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(id));
        byte[] wordFile = etterlevelseDokumentasjonToDoc.generateDocFor(etterlevelsedokumentasjon.getId(), Collections.emptyList(), Collections.emptyList(), true);

        P360Document document = p360Service.updateDocument(P360DocumentUpdateRequest.builder()
                .DocumentNumber(dokumentNummber)
                .Archive("Saksdokument")
                .DefaultValueSet("Etterlevelse")
                .Title("E" + etterlevelsedokumentasjon.getEtterlevelseNummer() + " test dokument")
                .DocumentDate(formatter.format(date))
                .Category("Internt notat uten oppfølging")
                .Status("J")
                .AccessGroup("Alle ansatte i Nav")
                .ResponsiblePersonEmail(SecurityUtils.getCurrentEmail())
                .Files(List.of(P360File.builder()
                        .Title(formatter.format(date) + "_Etterlevelse_E" + etterlevelsedokumentasjon.getEtterlevelseNummer())
                        .Format("docx")
                        .Base64Data(Base64.getEncoder().encodeToString(wordFile))
                        .build()))
                .build());
        return ResponseEntity.ok(document);
    }
}