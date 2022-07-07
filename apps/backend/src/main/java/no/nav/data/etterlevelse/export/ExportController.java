package no.nav.data.etterlevelse.export;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/export")
@Tag(name = "Export", description = "REST API for exports")
public class ExportController {

    private static final String WORDPROCESSINGML_DOCUMENT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private final CodelistToDoc codelistToDoc;
    private final KravToDoc kravToDoc;

    private final EtterlevelseToDoc etterlevelseToDoc;
    private final KravService kravService;
    private final CodelistService codelistService;
    private final EtterlevelseService etterlevelseService;

    public ExportController(CodelistToDoc codelistToDoc, KravToDoc kravToDoc, EtterlevelseToDoc etterlevelseToDoc, KravService kravService, CodelistService codelistService, EtterlevelseService etterlevelseService) {
        this.codelistToDoc = codelistToDoc;
        this.kravToDoc = kravToDoc;
        this.etterlevelseToDoc = etterlevelseToDoc;
        this.kravService = kravService;
        this.codelistService = codelistService;
        this.etterlevelseService = etterlevelseService;
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
            @RequestParam(name = "statuskoder", required = false) List<String> statuskoder
    ) {
        byte[] doc;
        String filename;

        if (kravId != null) {
            Krav krav = kravService.get(kravId);
            doc = kravToDoc.generateDocForKrav(krav);
            filename = "Dokumentajson for K" + krav.getKravNummer() + "." + krav.getVersion() + " " + krav.getNavn() + ".docx";
        } else {
            ListName list;
            List<String> code;
            if (relevansKoder != null) {
                list = ListName.RELEVANS;
                code = relevansKoder;
            } else if (temaKode != null) {
                list = ListName.TEMA;
                codelistService.validateListNameAndCode(list.name(), temaKode);

                code = CodelistService.getCodelist(ListName.LOV)
                        .stream().filter(l -> l.getData().get("tema").toString().equals(temaKode))
                        .map(Codelist::getCode)
                        .collect(Collectors.toList());

            } else if (lovKode != null) {
                list = ListName.LOV;
                code = new ArrayList<>();
                code.add(lovKode);
            } else if (ansvarligKode != null) {
                list = ListName.UNDERAVDELING;
                code = new ArrayList<>();
                code.add(ansvarligKode);
            } else {
                throw new ValidationException("No paramater given");
            }


            codelistService.validateListNameAndCodes(list.name(), code);
            doc = kravToDoc.generateDocFor(list, code, statuskoder);
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
            @RequestParam(name = "etterlevelseId", required = false) UUID etterlevelseId
    ) {
        String filename = "Dokumentasjon for etterlevelse - " + etterlevelseId + ".docx";
        byte[] doc = etterlevelseToDoc.generateDocForEtterlevelse(etterlevelseService.get(etterlevelseId));
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
        };
    }

}
