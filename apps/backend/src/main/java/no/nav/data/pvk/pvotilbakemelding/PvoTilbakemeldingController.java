package no.nav.data.pvk.pvotilbakemelding;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.ResourceType;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemedlingRequest;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemeldingResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/pvotilbakemelding")
@Tag(name = "Pvo tilbakemelding", description = "PVO tilbakemelding for PVK dokument")
public class PvoTilbakemeldingController {

    private final PvoTilbakemeldingService pvoTilbakemeldingService;
    private final PvkDokumentService pvkDokumentService;
    private final TeamcatResourceClient teamcatResourceClient;

    @Operation(summary = "Get All PVO tilbakemelding")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<PvoTilbakemeldingResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all Pvo tilbakemelding");
        Page<PvoTilbakemelding> page = pvoTilbakemeldingService.getAll(pageParameters);
        RestResponsePage<PvoTilbakemeldingResponse> response = new RestResponsePage<>(page).convert(PvoTilbakemeldingResponse::buildFrom);
        response.getContent().forEach(this::addResourceData);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get One PVO tilbakemelding")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<PvoTilbakemeldingResponse> getById(@PathVariable UUID id) {
        log.info("Get PVO tilbakemelding id={}", id);
        PvoTilbakemeldingResponse response = PvoTilbakemeldingResponse.buildFrom(pvoTilbakemeldingService.get(id));
        addResourceData(response);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get PVO tilbakemelding by PVK dokument id")
    @ApiResponse(description = "ok")
    @GetMapping("/pvkdokument/{pvkdokumentId}")
    public ResponseEntity<PvoTilbakemeldingResponse> getPvoTilbakemeldingByPvkDokumentId(@PathVariable String pvkdokumentId) {
        log.info("Get PVO tilbakemelding by PVK dokument id={}", pvkdokumentId);
        Optional<PvoTilbakemelding> pvoTilbakemelding = pvoTilbakemeldingService.getByPvkDokumentId(UUID.fromString(pvkdokumentId));
        return pvoTilbakemelding.map(tilbakemelding -> ResponseEntity.ok(PvoTilbakemeldingResponse.buildFrom(tilbakemelding))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create PVO tilbakemelding")
    @ApiResponse(responseCode = "201", description = "PVO tilbakemelding created")
    @PostMapping
    public ResponseEntity<PvoTilbakemeldingResponse> createPvoTilbakemelding(@RequestBody PvoTilbakemedlingRequest request) {
        log.info("Create PVO tilbakemelding");
        // kan kaste et data integrity violation exception(1 til 1 kobling mot pvk dokument)
        var pvoTilbakemelding = pvoTilbakemeldingService.save(request.convertToPvoTilbakemelding(), request.isUpdate());

        if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
            updatePvkDokumentStatusToVurdertAvPvo(pvoTilbakemelding);
        }

        return new ResponseEntity<>(PvoTilbakemeldingResponse.buildFrom(pvoTilbakemelding), HttpStatus.CREATED);
    }

    @Operation(summary = "Update PVO tilbakemelding")
    @ApiResponse(description = "PVO tilbakemelding updated")
    @PutMapping("/{id}")
    public ResponseEntity<PvoTilbakemeldingResponse> updatePvoTilbakemelding(@PathVariable UUID id, @Valid @RequestBody PvoTilbakemedlingRequest request) {
        log.info("Update PVO tilbakemelding id={}", id);

        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var pvoTilbakemeldingToUpdate = pvoTilbakemeldingService.get(id);

        if (pvoTilbakemeldingToUpdate == null) {
            throw new ValidationException(String.format("Could not find pvo tilbakemelding to be updated with id = %s ", id));
        }

        request.mergeInto(pvoTilbakemeldingToUpdate);
        var pvoTilbakemelding = pvoTilbakemeldingService.save(pvoTilbakemeldingToUpdate, request.isUpdate());

        if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
            updatePvkDokumentStatusToVurdertAvPvo(pvoTilbakemelding);
        }

        return ResponseEntity.ok(PvoTilbakemeldingResponse.buildFrom(pvoTilbakemelding));
    }

    @Operation(summary = "Delete PVO tilbakemelding")
    @ApiResponse(description = "PVO tilbakemelding deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<PvoTilbakemeldingResponse> deletePvoTilbakemeldingById(@PathVariable UUID id) {
        log.info("Delete PVO tilbakemelding id={}", id);
        var pvoTilbakemelding = pvoTilbakemeldingService.delete(id);
        if (pvoTilbakemelding == null) {
            log.warn("Could not find PVO tilbakemelding with id = {} to delete", id);
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(PvoTilbakemeldingResponse.buildFrom(pvoTilbakemelding));
        }
    }

    private void updatePvkDokumentStatusToVurdertAvPvo(PvoTilbakemelding pvoTilbakemelding) {
            log.info("Updating PVK document with id = {}, with status = {}, after PVO has finished the evaluation.", pvoTilbakemelding.getPvkDokumentId(), PvkDokumentStatus.VURDERT_AV_PVO);
            var pvkDokument = pvkDokumentService.get(pvoTilbakemelding.getPvkDokumentId());
            pvkDokument.setStatus(PvkDokumentStatus.VURDERT_AV_PVO);
            pvkDokumentService.save(pvkDokument, true);
    }

    private void addResourceData(PvoTilbakemeldingResponse response) {
        if (response.getAnsvarlig() != null && !response.getAnsvarlig().isEmpty()) {
            List<Resource> ansvarligData = new ArrayList<>();

            response.getAnsvarlig().forEach(ansvarlig -> {
                var resourceData = teamcatResourceClient.getResource(ansvarlig);
                if(resourceData.isPresent()) {
                    ansvarligData.add(resourceData.get());
                } else {
                    ansvarligData.add(Resource.builder()
                            .navIdent(ansvarlig)
                            .givenName("Fant ikke person med NAV ident: " + ansvarlig)
                            .familyName("Fant ikke person med NAV ident: " + ansvarlig)
                            .fullName("Fant ikke person med NAV ident: " + ansvarlig)
                            .email("Fant ikke person med NAV ident: " + ansvarlig)
                            .resourceType(ResourceType.INTERNAL)
                            .build()
                    );
                }
            });
            response.setAnsvarligData(ansvarligData);
        }
    }
}
