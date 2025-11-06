package no.nav.data.integration.p360;

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
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopFil;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.export.EtterlevelseDokumentasjonToDoc;
import no.nav.data.integration.p360.domain.P360ArchiveDocument;
import no.nav.data.integration.p360.dto.*;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@RestController
@Tag(name = "Public 360", description = "Public 360 for arkivering")
@RequestMapping("/p360")
@RequiredArgsConstructor
public class P360Controller {

    private final P360Service p360Service;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;
    private final BehandlingensLivslopService behandlingensLivslopService;
    private final PvkDokumentService pvkDokumentService;

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
                                                                             @RequestParam(name = "risikoeier", required = false) boolean risikoeier) {
        log.info("Archiving etterlevelse dokumentasjon with id {}", etterlevelseDokumentasjonId);
        var eDok = etterlevelseDokumentasjonService.get(etterlevelseDokumentasjonId);
        var pvkDokument = pvkDokumentService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId);

        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd");
        SimpleDateFormat titleDateformatter = new SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");
        Date date = new Date();

        try {
            if (eDok.getEtterlevelseDokumentasjonData().getP360CaseNumber() == null || eDok.getEtterlevelseDokumentasjonData().getP360CaseNumber().isEmpty()) {
                P360Case sak = p360Service.createCase(P360CaseRequest.builder()
                        .CaseType("Sak")
                        .DefaultValueSet("Etterlevelse")
                        .Title("E" + eDok.getEtterlevelseNummer() + " " + eDok.getTitle().replace(":", " -"))
                        .Status("B")
                        .AccessCode("U")
                        .AccessGroup("Alle ansatte i Nav")
                        .ResponsiblePersonIdNumber(SecurityUtils.getCurrentIdent())
                        .build());

                eDok.getEtterlevelseDokumentasjonData().setP360CaseNumber(sak.CaseNumber);
                eDok.getEtterlevelseDokumentasjonData().setP360Recno(sak.Recno);
                etterlevelseDokumentasjonRepo.save(eDok);
            }

            String filename = titleDateformatter.format(date) + "_Etterlevelse_E" + eDok.getEtterlevelseNummer();
            if (onlyActiveKrav) {
                filename += "_kun_gjeldende_krav_versjon";
            } else {
                filename += "_alle_krav_versjone";
            }

            String documentTitle  = "";
            if (pvoTilbakemelding && pvkDokument.isPresent()) {
                if (pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo() != null && pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo() > 1) {
                    documentTitle += (pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo() + ". ");
                }
                documentTitle += pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo() + ". Tilbakemelding fra Personvernombudet for ";
            } else if (risikoeier) {
                documentTitle += "Personvernkonsekvensvurdering for ";
            }

            documentTitle += "E" + eDok.getEtterlevelseNummer() + " " + eDok.getTitle().replace(":", " -").trim();

            //Opprette word doc filen
            byte[] wordFile = etterlevelseDokumentasjonToDoc.generateDocFor(eDok.getId(), Collections.emptyList(), Collections.emptyList(), onlyActiveKrav, (pvoTilbakemelding || risikoeier));

            // hente behandlingenslivslop filene
            var behandlingenslivslop = behandlingensLivslopService.getByEtterlevelseDokumentasjon(eDok.getId()).orElse(new BehandlingensLivslop());
            List<BehandlingensLivslopFil> BLLFiler = behandlingenslivslop.getBehandlingensLivslopData().getFiler();

            // opprette P360DocumentCreateRequest
            List<P360File> filer = new ArrayList<>();
            P360DocumentCreateRequest p360DocumentCreateRequest = P360DocumentCreateRequest.builder()
                    .CaseNumber(eDok.getEtterlevelseDokumentasjonData().getP360CaseNumber())
                    .Archive("Saksdokument")
                    .DefaultValueSet("Etterlevelse")
                    .Title(documentTitle)
                    .DocumentDate(formatter.format(date))
                    .Status("J")
                    .AccessGroup("Alle ansatte i Nav")
                    .ResponsiblePersonIdNumber(SecurityUtils.getCurrentIdent())
                    .build();

            filer.add(P360File.builder()
                    .Title(filename)
                    .Format("docx")
                    .Base64Data(Base64.getEncoder().encodeToString(wordFile))
                    .build());

            if (pvoTilbakemelding || risikoeier) {
                BLLFiler.forEach(behandlingensLivslopFil -> {
                    String[] bllFileName = behandlingensLivslopFil.getFilnavn().split("\\.");
                    filer.add(
                            P360File.builder()
                                    .Title(bllFileName[0])
                                    .Format(bllFileName[1])
                                    .Base64Data(Base64.getEncoder().encodeToString(behandlingensLivslopFil.getFil()))
                                    .build()
                    );
                });
            }

            p360DocumentCreateRequest.setFiles(filer);

            // lagre i den nye tabellen som het P360ArchiveDocument
            p360Service.save(p360DocumentCreateRequest);

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
                .Archive("Saksdokument")
                .DefaultValueSet("Etterlevelse")
                .Title("E" + etterlevelsedokumentasjon.getEtterlevelseNummer() + " test dokument")
                .DocumentDate(formatter.format(date))
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