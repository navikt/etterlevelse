package no.nav.data.etterlevelse.export;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.CodeUsageService;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieBegrunnelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.pvk.behandlingensArtOgOmfang.BehandlingensArtOgOmfangService;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfangData;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentData;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingData;

@Slf4j
@RestController
@RequestMapping("/export")
@Tag(name = "Export", description = "REST API for exports")
@RequiredArgsConstructor
public class ExportController {

    private static final String WORDPROCESSINGML_DOCUMENT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private final CodelistToDoc codelistToDoc;
    private final KravToDoc kravToDoc;

    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;
    private final KravService kravService;
    private final CodelistService codelistService;

    private final PvkDokumentToDoc pvkToDoc;

    private final CodeUsageService codeUsageService;

    private final EtterlevelseService etterlevelseService;

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    private final PvkDokumentService pvkDokumentService;

    private final BehandlingensArtOgOmfangService behandlingensArtOgOmfangService;

    private final PvoTilbakemeldingService pvoTilbakemeldingService;


    @Operation(summary = "Get export for codelist")
    @ApiResponse(description = "Doc fetched", content = @Content(schema = @Schema(implementation = byte[].class)))
    @Transactional(readOnly = true)
    @SneakyThrows
    @GetMapping(value = "/codelist", produces = WORDPROCESSINGML_DOCUMENT)
    public void getCodelist(
            HttpServletResponse response,
            @RequestParam(name = "code") ListName code
    ) {
        log.info("Exporting codelist to doc");
        String filename = "Dokumentasjon for kodeverk - " + cleanCodelistName(code) + ".docx";
        byte[] doc = codelistToDoc.generateDocFor(code);

        response.setContentType(WORDPROCESSINGML_DOCUMENT);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        StreamUtils.copy(doc, response.getOutputStream());
        response.flushBuffer();
    }

    @Operation(summary = "Get export for krav")
    @ApiResponse(description = "Doc fetched", content = @Content(schema = @Schema(implementation = byte[].class)))
    @Transactional(readOnly = true)
    @SneakyThrows
    @GetMapping(value = "/krav", produces = WORDPROCESSINGML_DOCUMENT)
    public void getKrav(
            HttpServletResponse response,
            @RequestParam(name = "kravId", required = false) UUID kravId,
            @RequestParam(name = "relevansKoder", required = false) List<String> relevansKoder,
            @RequestParam(name = "temaKode", required = false) String temaKode,
            @RequestParam(name = "lovKode", required = false) String lovKode,
            @RequestParam(name = "ansvarligKode", required = false) String ansvarligKode,
            @RequestParam(name = "statusKoder", required = false) List<String> statusKoder
    ) {
        log.info("Exporting krav to doc");
        byte[] doc;
        String filename;

        if (kravId != null) {
            log.info("Exporting krav to doc");
            Krav krav = kravService.get(kravId);
            doc = kravToDoc.generateDocForKrav(krav);
            filename = "Dokumentajson for K" + krav.getKravNummer() + "." + krav.getVersion() + " " + krav.getNavn() + ".docx";
            log.info("Exporting krav K" + krav.getKravNummer() + "." + krav.getVersion() + " to doc");
        } else {
            ListName list;
            List<String> code;
            if (relevansKoder != null) {
                log.info("Exporting list of krav filtered by relevans to doc");
                list = ListName.RELEVANS;
                code = relevansKoder;
            } else if (temaKode != null) {
                log.info("Exporting list of krav filtered by tema to doc");
                list = ListName.TEMA;
                codelistService.validateListNameAndCode(list.name(), temaKode);
                code = codeUsageService.findCodeUsage(ListName.TEMA, temaKode).getCodelist().stream().map(Codelist::getCode).toList();
            } else if (lovKode != null) {
                log.info("Exporting list of krav filtered by lov to doc");
                list = ListName.LOV;
                code = new ArrayList<>();
                code.add(lovKode);
            } else if (ansvarligKode != null) {
                log.info("Exporting list of krav filtered by underavdeling to doc");
                list = ListName.UNDERAVDELING;
                code = new ArrayList<>();
                code.add(ansvarligKode);
            } else {
                throw new ValidationException("No paramater given");
            }

            if (temaKode == null) {
                codelistService.validateListNameAndCodes(list.name(), code);
            }

            doc = kravToDoc.generateDocFor(list, code, statusKoder);
            filename = "Dokumentajson for krav med " + list.name() + " " + code;
        }

        response.setContentType(WORDPROCESSINGML_DOCUMENT);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        StreamUtils.copy(doc, response.getOutputStream());
        response.flushBuffer();
    }

    @Operation(summary = "Get export for etterlevelse dokumentasjon")
    @ApiResponse(description = "Doc fetched", content = @Content(schema = @Schema(implementation = byte[].class)))
    @Transactional(readOnly = true)
    @SneakyThrows
    @GetMapping(value = "/etterlevelsedokumentasjon", produces = WORDPROCESSINGML_DOCUMENT)
    public void getEtterlevelseDokumentasjon(
            HttpServletResponse response,
            @RequestParam(name = "etterlevelseId", required = false) UUID etterlevelseId,
            @RequestParam(name = "etterlevelseDokumentasjonId", required = false) UUID etterlevelseDokumentasjonId,
            @RequestParam(name = "statuskoder", required = false) List<String> statusKoder,
            @RequestParam(name = "temakode", required = false) String temaKode,
            @RequestParam(name = "onlyActiveKrav", required = false) boolean onlyActiveKrav
    ) {
        log.info("Exporting etterlevelse dokumentasjon to doc");
        Date date = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");

        String filename = formatter.format(date) + "_Etterlevelse_E";
        byte[] doc;

        if (etterlevelseId != null) {
            Etterlevelse etterlevelse = etterlevelseService.get(etterlevelseId);
            var eDok = etterlevelseDokumentasjonService.get(etterlevelse.getEtterlevelseDokumentasjonId());
            filename += eDok.getEtterlevelseNummer() + "."
                    + eDok.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon()
                    + ".docx";
            log.info("Exporting 1 etterlevelse to doc");
            doc = etterlevelseDokumentasjonToDoc.generateDocForEtterlevelse(etterlevelseId);
        } else if (etterlevelseDokumentasjonId != null) {
            log.info("Exporting list of etterlevelse for etterlevelse dokumentasjon with id " + etterlevelseDokumentasjonId + " to doc");
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(etterlevelseDokumentasjonId);
            List<String> lover;

            if (temaKode != null) {
                log.info("Exporting list of etterlevelse for etterlevelse dokumentasjon with id " + etterlevelseDokumentasjonId + " to doc filtered by tema");
                filename += etterlevelseDokumentasjon.getEtterlevelseNummer()
                        + "." + etterlevelseDokumentasjon.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon()
                        + "filtert_med_tema_" + temaKode;

                codelistService.validateListNameAndCode(ListName.TEMA.name(), temaKode);
                lover = codeUsageService.findCodeUsage(ListName.TEMA, temaKode).getCodelist().stream().map(Codelist::getCode).toList();
            } else {
                lover = new ArrayList<>();
                filename += etterlevelseDokumentasjon.getEtterlevelseNummer() + "."
                        + etterlevelseDokumentasjon.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon();
            }

            doc = etterlevelseDokumentasjonToDoc.generateDocFor(etterlevelseDokumentasjonId, statusKoder, lover, onlyActiveKrav, false);
        } else {
            throw new ValidationException("No paramater given");
        }

        if (onlyActiveKrav) {
            filename += "_kun_gjeldende_krav_versjon.docx";
        } else {
            filename += "_alle_krav_versjoner.docx";
        }

        response.setContentType(WORDPROCESSINGML_DOCUMENT);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        StreamUtils.copy(doc, response.getOutputStream());
        response.flushBuffer();
    }

    @Operation(summary = "Get export for pvk dokument")
    @ApiResponse(description = "Doc fetched", content = @Content(schema = @Schema(implementation = byte[].class)))
    @Transactional(readOnly = true)
    @SneakyThrows
    @GetMapping(value = "/pvkdokument", produces = "application/zip")
    public void getPvkDokument(
            HttpServletResponse response,
            @RequestParam(name = "etterlevelseDokumentasjonId", required = false) UUID etterlevelseDokumentasjonId,
            @RequestParam(name = "onlyActiveKrav", required = false) boolean onlyActiveKrav
    ) {
        log.info("export pvk dokument to doc");
        var eDok = etterlevelseDokumentasjonService.get(etterlevelseDokumentasjonId);

        SimpleDateFormat titleDateformatter = new SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");
        Date date = new Date();

        String filename = "attachment; filename=" + titleDateformatter.format(date)
                + "_Etterlevelse_E" + eDok.getEtterlevelseNummer()
                + "." + eDok.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon();
        if (onlyActiveKrav) {
            filename += "_kun_gjeldende_krav_versjon.zip";
        } else {
            filename += "_alle_krav_versjone.zip";
        }

        String documentTitle = "Personvernkonsekvensvurdering for E" + eDok.getEtterlevelseNummer()
                + " versjon " + eDok.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon()
                + ", " + eDok.getTitle().replace(":", " -").trim();

        byte[] wordFile = etterlevelseDokumentasjonToDoc.generateDocFor(eDok.getId(), Collections.emptyList(), Collections.emptyList(), onlyActiveKrav, true);

        byte[] zipFile = pvkToDoc.generateZipWithBLLFilesFromDoc(wordFile, etterlevelseDokumentasjonId, documentTitle);

        response.setContentType("application/zip");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, filename);
        StreamUtils.copy(zipFile, response.getOutputStream());
        response.flushBuffer();
    }


    @Operation(summary = "Bulk export of the latest etterlevelse dokumentasjoner with full etterlevelse data, without team, person, and risikoeier data")
    @Transactional(readOnly = true)
    @SneakyThrows
    @GetMapping(value = "/etterlevelsedokumentasjon/bulk", produces = "application/json;charset=UTF-8")
    public void getBulkEtterlevelseDokumentasjon(
            HttpServletResponse response,
            @RequestParam(name = "limit", defaultValue = "100") int limit,
            @RequestParam(name = "onlyActiveKrav", defaultValue = "true") boolean onlyActiveKrav
    ) {
        log.info("Bulk exporting {} latest etterlevelse dokumentasjoner, onlyActiveKrav={}", limit, onlyActiveKrav);
        var documents = etterlevelseDokumentasjonService.getLatestCreated(limit);

        var rows = documents.stream().map(doc -> {
            var data = doc.getEtterlevelseDokumentasjonData();
            List<Etterlevelse> etterlevelser = etterlevelseService.getByEtterlevelseDokumentasjon(doc.getId());
            List<Krav> alleAktivKrav = kravService.findForEtterlevelseDokumentasjon(doc.getId())
                    .stream().filter(k -> k.getStatus().equals(KravStatus.AKTIV)).toList();

            var pvkOpt = pvkDokumentService.getByEtterlevelseDokumentasjon(doc.getId());
            var pvkData = pvkOpt.map(pvk -> pvk.getPvkDokumentData()).orElse(null);
            var artOgOmfangData = behandlingensArtOgOmfangService.getByEtterlevelseDokumentasjonId(doc.getId())
                    .map(a -> a.getBehandlingensArtOgOmfangData()).orElse(null);
            var pvoTilbakemeldingData = pvkOpt.flatMap(pvk -> pvoTilbakemeldingService.getByPvkDokumentId(pvk.getId()))
                    .map(pvo -> pvo.getPvoTilbakemeldingData()).orElse(null);

            List<BulkEtterlevelseRow> etterlevelseRows = new ArrayList<>();
            if (onlyActiveKrav) {
                for (Krav krav : alleAktivKrav) {
                    var match = etterlevelser.stream()
                            .filter(e -> e.getKravNummer().equals(krav.getKravNummer()) && e.getKravVersjon().equals(krav.getKravVersjon()))
                            .findFirst();
                    etterlevelseRows.add(buildEtterlevelseRow(krav, match.orElse(null)));
                }
            } else {
                for (Krav krav : alleAktivKrav) {
                    var sameNummer = etterlevelser.stream()
                            .filter(e -> e.getKravNummer().equals(krav.getKravNummer()))
                            .toList();
                    var matchCurrent = sameNummer.stream()
                            .filter(e -> e.getKravVersjon().equals(krav.getKravVersjon()))
                            .findFirst();
                    etterlevelseRows.add(buildEtterlevelseRow(krav, matchCurrent.orElse(null)));
                    for (int v = krav.getKravVersjon() - 1; v > 0; v--) {
                        int fv = v;
                        var earlierMatch = sameNummer.stream().filter(e -> e.getKravVersjon().equals(fv)).findFirst();
                        kravService.getByKravNummer(krav.getKravNummer(), fv)
                                .ifPresent(k -> etterlevelseRows.add(buildEtterlevelseRow(k, earlierMatch.orElse(null))));
                    }
                }
            }

            return new BulkExportRow(
                    doc.getId().toString(),
                    data.getEtterlevelseNummer(),
                    data.getTitle(),
                    data.getStatus() != null ? data.getStatus().name() : null,
                    data.getEtterlevelseDokumentVersjon(),
                    data.getBehandlingIds(),
                    data.getDpBehandlingIds(),
                    data.getNomAvdelingId(),
                    data.getAvdelingNavn(),
                    data.getBeskrivelse(),
                    data.getRisikovurderinger(),
                    doc.getCreatedDate() != null ? doc.getCreatedDate().toString() : null,
                    doc.getLastModifiedDate() != null ? doc.getLastModifiedDate().toString() : null,
                    etterlevelseRows,
                    pvkData,
                    artOgOmfangData,
                    pvoTilbakemeldingData
            );
        }).toList();

        response.setContentType("application/json;charset=UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=etterlevelse_bulk_export.json");
        new ObjectMapper().writeValue(response.getOutputStream(), rows);
        response.flushBuffer();
    }

    private BulkEtterlevelseRow buildEtterlevelseRow(Krav krav, Etterlevelse etterlevelse) {
        return new BulkEtterlevelseRow(
                etterlevelse != null ? etterlevelse.getId().toString() : null,
                krav.getKravNummer(),
                krav.getKravVersjon(),
                krav.getData().getNavn(),
                krav.getData().getHensikt(),
                krav.getData().getBeskrivelse(),
                krav.getData().getRegelverk(),
                krav.getData().getSuksesskriterier(),
                etterlevelse != null && etterlevelse.getEtterlevelseData().getStatus() != null
                        ? etterlevelse.getEtterlevelseData().getStatus().name() : null,
                etterlevelse != null && etterlevelse.isEtterleves(),
                etterlevelse != null ? etterlevelse.getStatusBegrunnelse() : null,
                etterlevelse != null && etterlevelse.getEtterlevelseData().getSuksesskriterieBegrunnelser() != null
                        ? etterlevelse.getEtterlevelseData().getSuksesskriterieBegrunnelser() : List.of()
        );
    }

    record BulkExportRow(
            String id,
            Integer etterlevelseNummer,
            String title,
            String status,
            Integer etterlevelseDokumentVersjon,
            List<String> behandlingIds,
            List<String> dpBehandlingIds,
            String nomAvdelingId,
            String avdelingNavn,
            String beskrivelse,
            List<String> risikovurderinger,
            String createdDate,
            String lastModifiedDate,
            List<BulkEtterlevelseRow> etterlevelser,
            PvkDokumentData pvk,
            BehandlingensArtOgOmfangData behandlingensArtOgOmfang,
            PvoTilbakemeldingData pvoTilbakemelding
    ) {}

    record BulkEtterlevelseRow(
            String etterlevelseId,
            Integer kravNummer,
            Integer kravVersjon,
            String kravNavn,
            String kravHensikt,
            String kravBeskrivelse,
            List<Regelverk> regelverk,
            List<Suksesskriterie> suksesskriterier,
            String etterlevelseStatus,
            boolean etterleves,
            String statusBegrunnelse,
            List<SuksesskriterieBegrunnelse> suksesskriterieBegrunnelser
    ) {}

    private String cleanCodelistName(ListName listName) {
        return switch (listName) {
            case LOV -> "Lov";
            case TEMA -> "Tema";
            case AVDELING -> "Avdeling";
            case UNDERAVDELING -> "underavdeling";
            case RELEVANS -> "Relevans";
            case YTTERLIGERE_EGENSKAPER -> "Ytterligere egenskaper";
            case PVO_VURDERING -> "Pvo vurdering";
        };
    }

}
