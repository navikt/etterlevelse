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
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentListItemResponse;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentRequest;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentResponse;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/pvkdokument")
@Tag(name = "Pvk Dokument", description = "Pvk Dokument for etterlevelsesdokumentasjon")
public class PvkDokumentController {

    private final PvkDokumentService pvkDokumentService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final PvoTilbakemeldingService pvoTilbakemeldingService;

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

    @Operation(summary = "Get All Pvk Document for PVO")
    @ApiResponse(description = "ok")
    @GetMapping("/pvo")
    public ResponseEntity<RestResponsePage<PvkDokumentListItemResponse>> getAllForPvo(
            PageParameters pageParameters
    ) {
        log.info("Get all Pvk Document for PVO oversikt page");
        List<PvkDokumentListItemResponse> pvkDokumentListItemResponses = new ArrayList<>();
        Page<PvkDokument> page = pvkDokumentService.getAll(pageParameters);

        page.forEach(pvkDokument -> {
            var etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId());
            pvkDokumentListItemResponses.add(
                    PvkDokumentListItemResponse.buildFrom(pvkDokument, etterlevelseDokumentasjon)
            );
        });

        return ResponseEntity.ok(new RestResponsePage<>(pvkDokumentListItemResponses));
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
    public ResponseEntity<PvkDokumentResponse> getPvkDokumentByEtterlevelseDokumentId(@PathVariable UUID etterlevelseDokumentId) {
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

        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var pvkDokumentToUpdate = pvkDokumentService.get(id);

        if(pvkDokumentToUpdate == null) {
            throw new ValidationException(String.format("Could not find pvk dokument to be updated with id = %s ", id));
        }

        request.mergeInto(pvkDokumentToUpdate);
        var pvkDokument = pvkDokumentService.save(pvkDokumentToUpdate, request.isUpdate());
        updatePvoTilbakemeldingStatus(pvkDokument);
        return ResponseEntity.ok(PvkDokumentResponse.buildFrom(pvkDokument));
    }

    @Operation(summary = "Delete Pvk Document")
    @ApiResponse(description = "Pvk Document deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<PvkDokumentResponse> deletePvkDokumentById(@PathVariable UUID id) {
        log.info("Delete Pvk Document id={}", id);
        var pvkDokument = pvkDokumentService.deletePvkAndAllChildren(id);
        if (pvkDokument == null) {
            log.warn("Could not delete pvk dokument with id = {}: Non-existing og related to other resources", id);
            throw new ValidationException("Could not delete pvk dokument: Non-existing og related to other resources");
        } else {
            return ResponseEntity.ok(PvkDokumentResponse.buildFrom(pvkDokument));
        }
    }

    private void updatePvoTilbakemeldingStatus(PvkDokument pvkDokument) {
        log.info("Updating PVO tilbakemelding status with id = {}", pvkDokument.getId());
        if (pvkDokument.getStatus()  != PvkDokumentStatus.UNDERARBEID && pvkDokument.getStatus() != PvkDokumentStatus.SENDT_TIL_PVO) {
        var pvoTilbakmelding = pvoTilbakemeldingService.getByPvkDokumentId(pvkDokument.getId()).orElse(null);

        if (pvoTilbakmelding != null) {
            if (pvkDokument.getStatus() == PvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING) {
                pvoTilbakmelding.setStatus(PvoTilbakemeldingStatus.TRENGER_REVURDERING);
                pvoTilbakemeldingService.save(pvoTilbakmelding, true);
            } else if (pvoTilbakmelding.getStatus() == PvoTilbakemeldingStatus.TRENGER_REVURDERING && (pvkDokument.getStatus() == PvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID || pvkDokument.getStatus() == PvkDokumentStatus.VURDERT_AV_PVO)) {
                pvoTilbakmelding.setStatus(PvoTilbakemeldingStatus.FERDIG);
                pvoTilbakemeldingService.save(pvoTilbakmelding, true);
            }
        } else {
            throw new ValidationException("No pvo tilbakemelding found for id = " + pvkDokument.getId());
        }
    }
    }
}
