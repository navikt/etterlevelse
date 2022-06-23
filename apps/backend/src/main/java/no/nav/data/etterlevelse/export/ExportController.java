package no.nav.data.etterlevelse.export;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.aspectj.apache.bcel.classfile.Code;
import org.springframework.http.HttpHeaders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/export")
@Tag(name = "Export", description = "REST API for exports")
public class ExportController {

    private static final String WORDPROCESSINGML_DOCUMENT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private final CodelistToDoc codelistToDoc;
    private final KravToDoc kravToDoc;
    private final KravService kravService;
    private final CodelistService codelistService;

    public ExportController(CodelistToDoc codelistToDoc, KravToDoc kravToDoc, KravService kravService, CodelistService codelistService) {
        this.codelistToDoc = codelistToDoc;
        this.kravToDoc = kravToDoc;
        this.kravService = kravService;
        this.codelistService = codelistService;
    }


    @Operation(summary = "Get export for codelist")
    @ApiResponse(description = "Doc fetched", content = @Content(schema = @Schema(implementation = byte[].class)))
    @Transactional(readOnly = true)
    @SneakyThrows
    @GetMapping(value = "/codelist", produces = WORDPROCESSINGML_DOCUMENT)
    public void getCodelist(
            HttpServletResponse response,
            @RequestParam(name = "code") ListName code
    ){
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
            @RequestParam(name = "relevans", required = false) List<String> relevans,
            @RequestParam(name = "tema", required = false) String tema,
            @RequestParam(name = "lov", required = false) String lov,
            @RequestParam(name = "ansvarlig", required = false) String ansvarlig
    ) {
        byte[] doc = new byte[0];
        String filename;

        if(kravId != null) {
            Krav krav = kravService.get(kravId);
            //doc = kravToDoc.generateDocForKrav(krav);
            filename = "Dokumentajson for K"+krav.getKravNummer()+"."+krav.getVersion()+" "+krav.getNavn() + ".docx";
        } else {
            ListName list;
            List<String> code;
            if(relevans != null){
                list = ListName.RELEVANS;
                code = relevans;
            } else if (tema != null) {
                list = ListName.TEMA;
                codelistService.validateListNameAndCode(list.name(), tema);

                List<String> lovKoder = CodelistService.getCodelist(ListName.LOV)
                                          .stream().filter(l -> l.getData().get("tema").toString() == tema)
                                          .map(l -> l.getCode())
                                          .collect(Collectors.toList());
                code = lovKoder;

            } else if (lov != null) {
                list = ListName.LOV;
                code = new ArrayList<>();
                code.add(lov);
            } else if (ansvarlig != null) {
                list = ListName.UNDERAVDELING;
                code = new ArrayList<>();
                code.add(ansvarlig);
            } else {
                throw new ValidationException("No paramater given");
            }

            codelistService.validateListNameAndCodes(list.name(), code);
            //doc = kravToDoc.generateDocFor(list, code);
            filename = "Dokumentajson for krav med " + list.name() + " " + code;
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
        };
    }

}
