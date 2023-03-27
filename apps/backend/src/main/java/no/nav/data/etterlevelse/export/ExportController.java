package no.nav.data.etterlevelse.export;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.CodeUsageService;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import org.springframework.http.HttpHeaders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/export")
@Tag(name = "Export", description = "REST API for exports")
public class ExportController {

    private static final String WORDPROCESSINGML_DOCUMENT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private final CodelistToDoc codelistToDoc;
    private final KravToDoc kravToDoc;

    private final EtterlevelseToDoc etterlevelseToDoc;
    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;
    private final KravService kravService;
    private final CodelistService codelistService;

    private final CodeUsageService codeUsageService;

    private final BehandlingService behandlingService;

    private final EtterlevelseService etterlevelseService;

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    public ExportController(CodelistToDoc codelistToDoc, KravToDoc kravToDoc, EtterlevelseToDoc etterlevelseToDoc, EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc, KravService kravService, CodelistService codelistService, CodeUsageService codeUsageService, BehandlingService behandlingService,
                            EtterlevelseService etterlevelseService, EtterlevelseDokumentasjonService etterlevelseDokumentasjonService) {
        this.codelistToDoc = codelistToDoc;
        this.kravToDoc = kravToDoc;
        this.etterlevelseToDoc = etterlevelseToDoc;
        this.etterlevelseDokumentasjonToDoc = etterlevelseDokumentasjonToDoc;
        this.kravService = kravService;
        this.codelistService = codelistService;
        this.codeUsageService = codeUsageService;
        this.behandlingService = behandlingService;
        this.etterlevelseService = etterlevelseService;
        this.etterlevelseDokumentasjonService = etterlevelseDokumentasjonService;
    }


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

            if(temaKode == null) {
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

    @Operation(summary = "Get export for etterlevelse")
    @ApiResponse(description = "Doc fetched", content = @Content(schema = @Schema(implementation = byte[].class)))
    @Transactional(readOnly = true)
    @SneakyThrows
    @GetMapping(value = "/etterlevelse", produces = WORDPROCESSINGML_DOCUMENT)
    public void getEtterlevelse(
            HttpServletResponse response,
            @RequestParam(name = "etterlevelseId", required = false) UUID etterlevelseId,
            @RequestParam(name = "behandlingId", required = false) UUID behandlingId,
            @RequestParam(name = "statuskoder", required = false) List<String> statusKoder,
            @RequestParam(name = "temakode", required = false) String temaKode
    ) {
        log.info("Exporting etterlevelse to doc");
        String filename;
        byte[] doc;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");
        Date date = new Date();


        if (etterlevelseId != null) {
            Etterlevelse etterlevelse = etterlevelseService.get(etterlevelseId);
            filename = formatter.format(date) + "_Etterlevelse_B" + behandlingService.getBehandling(etterlevelse.getBehandlingId()).getNummer() +".docx";
            log.info("Exporting 1 etterlevelse to doc");
            doc = etterlevelseToDoc.generateDocForEtterlevelse(etterlevelseId);
        } else if (behandlingId != null) {
            log.info("Exporting list of etterlevelse for behandling with id " + behandlingId + " to doc");
            Behandling behandling = behandlingService.getBehandling(behandlingId.toString());
            filename = formatter.format(date) + "_Etterlevelse_B" + behandling.getNummer() + ".docx";
            List<String> lover;

            if(temaKode != null){
                log.info("Exporting list of etterlevelse for behandling with id " + behandlingId + " to doc filtered by tema");
                filename = formatter.format(date) + "_Etterlevelse_B" + behandling.getNummer() + "filtert_med_tema_" + temaKode +".docx";
                codelistService.validateListNameAndCode(ListName.TEMA.name(), temaKode);
                lover = codeUsageService.findCodeUsage(ListName.TEMA, temaKode).getCodelist().stream().map(Codelist::getCode).toList();
            } else {
                lover = new ArrayList<>();
            }
            doc = etterlevelseToDoc.generateDocFor(behandlingId, statusKoder, lover, temaKode);
        } else {
            throw new ValidationException("No paramater given");
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
            @RequestParam(name = "temakode", required = false) String temaKode
    ) {
        log.info("Exporting etterlevelse dokumentasjon to doc");
        String filename;
        byte[] doc;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");
        Date date = new Date();


        if (etterlevelseId != null) {
            Etterlevelse etterlevelse = etterlevelseService.get(etterlevelseId);
            filename = formatter.format(date) + "_Etterlevelse_E" + etterlevelseDokumentasjonService.get(UUID.fromString(etterlevelse.getEtterlevelseDokumentasjonId())).getEtterlevelseNummer() +".docx";
            log.info("Exporting 1 etterlevelse to doc");
            doc = etterlevelseDokumentasjonToDoc.generateDocForEtterlevelse(etterlevelseId);
        } else if (etterlevelseDokumentasjonId != null) {
            log.info("Exporting list of etterlevelse for etterlevelse dokumentasjon with id " + etterlevelseDokumentasjonId + " to doc");
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(etterlevelseDokumentasjonId);
            filename = formatter.format(date) + "_Etterlevelse_E" + etterlevelseDokumentasjon.getEtterlevelseNummer() + ".docx";
            List<String> lover;

            if(temaKode != null){
                log.info("Exporting list of etterlevelse for etterlevelse dokumentasjon with id " + etterlevelseDokumentasjonId + " to doc filtered by tema");
                filename = formatter.format(date) + "_Etterlevelse_E" + etterlevelseDokumentasjon.getEtterlevelseNummer() + "filtert_med_tema_" + temaKode +".docx";
                codelistService.validateListNameAndCode(ListName.TEMA.name(), temaKode);
                lover = codeUsageService.findCodeUsage(ListName.TEMA, temaKode).getCodelist().stream().map(Codelist::getCode).toList();
            } else {
                lover = new ArrayList<>();
            }
            doc = etterlevelseDokumentasjonToDoc.generateDocFor(etterlevelseDokumentasjonId, statusKoder, lover, temaKode);
        } else {
            throw new ValidationException("No paramater given");
        }

        response.setContentType(WORDPROCESSINGML_DOCUMENT);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        StreamUtils.copy(doc, response.getOutputStream());
        response.flushBuffer();
    }

    private String cleanCodelistName(ListName listName) {
        return switch (listName) {
            case LOV -> "Lov";
            case TEMA -> "Tema";
            case AVDELING -> "Avdeling";
            case UNDERAVDELING -> "underavdeling";
            case RELEVANS -> "Relevans";
            case VIRKEMIDDELTYPE -> "Virkemiddel type";
        };
    }

}
