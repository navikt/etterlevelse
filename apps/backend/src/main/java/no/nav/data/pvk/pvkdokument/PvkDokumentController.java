package no.nav.data.pvk.pvkdokument;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentRequest;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentResponse;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/pvkdokument")
@Tag(name = "Pvk Dokument", description = "Pvk Dokument for etterlevelsesdokumentasjon")
public class PvkDokumentController {

    private final PvkDokumentService pvkDokumentService;

    @Operation(summary = "Get All Pvk Document")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<PvkDokumentResponse>> getAll(
            PageParameters pageParameters
    ) {
        log.info("Get all Pvk Document");
        Page<PvkDokument> page = pvkDokumentService.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(PvkDokumentResponse::buildFrom));
    }

    @Operation(summary = "Get One Pvk Document")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<PvkDokumentResponse> getById(@PathVariable UUID id) {
        log.info("Get Pvk Document id={}", id);
        return ResponseEntity.ok(PvkDokumentResponse.buildFrom(pvkDokumentService.get(id)));
    }

    @Operation(summary = "Get Pvk Document by etterlevelsedokument id")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelsedokument/{etterlevelseDokumentId}")
    public ResponseEntity<PvkDokumentResponse> getPvkDokumentByEtterlevelseDokumentId(@PathVariable String etterlevelseDokumentId) {
        log.info("Get Pvk Document by etterlevelseDokument id={}", etterlevelseDokumentId);
        Optional<PvkDokument> pvkDokument = pvkDokumentService.getByEtterlevelseDokumentasjon(etterlevelseDokumentId);

        return pvkDokument.map(dokument -> ResponseEntity.ok(PvkDokumentResponse.buildFrom(dokument))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create Pvk Document")
    @ApiResponse(responseCode = "201", description = "PvkDokument created")
    @PostMapping
    public ResponseEntity<PvkDokumentResponse> createPvkDokumente(@RequestBody PvkDokumentRequest request) {
        log.info("Create PvkDokument");

        var pvkDokument = pvkDokumentService.save(request.convertToPvkDokument(), request.isUpdate());

        return new ResponseEntity<>(PvkDokumentResponse.buildFrom(pvkDokument), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Pvk Document")
    @ApiResponse(description = "Pvk Document updated")
    @PutMapping("/{id}")
    public ResponseEntity<PvkDokumentResponse> updatePvkDokument(@PathVariable UUID id, @Valid @RequestBody PvkDokumentRequest request) {
        log.info("Update Pvk Document id={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var pvkDokumentToUpdate = pvkDokumentService.get(id);

        if(pvkDokumentToUpdate == null) {
            throw new ValidationException(String.format("Could not find pvk dokument to be updated with id = %s ", request.getId()));
        }

        request.mergeInto(pvkDokumentToUpdate);
        var pvkDokument = pvkDokumentService.save(pvkDokumentToUpdate, request.isUpdate());
        return ResponseEntity.ok(PvkDokumentResponse.buildFrom(pvkDokument));
    }

    @Operation(summary = "Delete Pvk Document")
    @ApiResponse(description = "Pvk Document deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<PvkDokumentResponse> deletePvkDokumentById(@PathVariable UUID id) {
        log.info("Delete Pvk Document id={}", id);
        var pvkDokument = pvkDokumentService.delete(id);
        if (pvkDokument == null) {
            log.warn("Could not delete pvk dokument with id = {}: Non-existing og related to other resources", id);
            throw new ValidationException("Could not delete pvk dokument: Non-existing og related to other resources");
        } else {
            return ResponseEntity.ok(PvkDokumentResponse.buildFrom(pvkDokument));
        }
    }

}
