package no.nav.data.etterlevelse.codelist;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.CodelistService.ListReq;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.AllCodelistResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistRequest;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StringUtils.toUpperCaseAndTrim;

@Slf4j
@RestController
@RequestMapping("/codelist")
@Tag(name = "Codelist", description = "REST API for common list of values")
public class CodelistController {

    private final CodelistService service;

    public CodelistController(CodelistService service) {
        this.service = service;
    }

    @Operation(summary = "Get the entire Codelist")
    @ApiResponse(description = "Entire Codelist fetched")
    @GetMapping
    public AllCodelistResponse findAll(@RequestParam(value = "refresh", required = false, defaultValue = "false") boolean refresh) {
        log.info("Received a request for and returned the entire Codelist {}", refresh ? "refreshed" : "");
        if (refresh) {
            service.refreshCache();
        }
        return new AllCodelistResponse(CodelistService.getAll().stream().map(Codelist::toResponse).collect(Collectors.groupingBy(CodelistResponse::getList)));
    }

    @Operation(summary = "Get codes and descriptions for listName")
    @ApiResponse(description = "Fetched codes for listName", content = @Content(array = @ArraySchema(schema = @Schema(implementation = CodelistResponse.class))))
    @GetMapping("/{listName}")
    public List<CodelistResponse> getByListName(@PathVariable String listName) {
        String listUpper = toUpperCaseAndTrim(listName);
        log.info("Received a request for all codelists with listName={}", listUpper);
        new ListReq(listUpper).validate();
        return CodelistService.getCodelistResponseList(ListName.valueOf(listUpper));
    }

    @Operation(summary = "Get for code in listName")
    @ApiResponse(description = "Codelist fetched")
    @GetMapping("/{listName}/{code}")
    public CodelistResponse getByListNameAndCode(@PathVariable String listName, @PathVariable String code) {
        String listUpper = toUpperCaseAndTrim(listName);
        String codeUpper = toUpperCaseAndTrim(code);
        log.info("Received a request for the codelist with the code={} in listName={}", codeUpper, listUpper);
        service.validateListNameAndCode(listUpper, codeUpper);
        return CodelistService.getCodelistResponse(ListName.valueOf(listUpper), codeUpper);
    }

    @Operation(summary = "Create Codelist")
    @ApiResponse(responseCode = "201", description = "Codelist successfully created", content = @Content(array = @ArraySchema(schema = @Schema(implementation = CodelistResponse.class))))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public List<CodelistResponse> save(@Valid @RequestBody List<CodelistRequest> requests) {
        log.info("Received a requests to create codelists");
        requests = StreamUtils.nullToEmptyList(requests);
        service.validateRequest(requests);

        return service.save(requests).stream().map(Codelist::toResponse).collect(Collectors.toList());
    }

    @Operation(summary = "Update Codelist")
    @ApiResponse(description = "Codelist updated", content = @Content(array = @ArraySchema(schema = @Schema(implementation = CodelistResponse.class))))
    @PutMapping
    public List<CodelistResponse> update(@Valid @RequestBody List<CodelistRequest> requests) {
        log.info("Received a request to update codelists");
        requests = StreamUtils.nullToEmptyList(requests);
        service.validateRequest(requests);

        return service.update(requests).stream().map(Codelist::toResponse).collect(Collectors.toList());
    }

    @Operation(summary = "Delete Codelist")
    @ApiResponse(description = "Codelist deleted")
    @DeleteMapping("/{listName}/{code}")
    @Transactional
    public void delete(@PathVariable String listName, @PathVariable String code) {
        listName = toUpperCaseAndTrim(listName);
        code = toUpperCaseAndTrim(code);
        log.info("Received a request to delete code={} in the list={}", code, listName);
        service.delete(ListName.valueOf(listName), code);
        log.info("Deleted code={} in the list={}", code, listName);
    }

    @Operation(summary = "Refresh Codelist")
    @ApiResponse(description = "Codelist refreshed")
    @GetMapping("/refresh")
    public void refresh() {
        log.info("Refreshed the codelists");
        service.refreshCache();
    }

}
