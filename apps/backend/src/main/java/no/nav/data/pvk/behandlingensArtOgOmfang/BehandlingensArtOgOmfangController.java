package no.nav.data.pvk.behandlingensArtOgOmfang;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfang;
import no.nav.data.pvk.behandlingensArtOgOmfang.dto.BehandlingensArtOgOmfangRequest;
import no.nav.data.pvk.behandlingensArtOgOmfang.dto.BehandlingensArtOgOmfangResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/behadlingens-art-og-omfang")
@Tag(name = "Behadlingens art og omfang", description = "Behadlingens art og omfang for etterlevelsesdokumentasjon")
public class BehandlingensArtOgOmfangController {
    private final BehandlingensArtOgOmfangService service;

    @Operation(summary = "Get Behadlingens art og omfang")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<BehandlingensArtOgOmfangResponse>> getAll(
            PageParameters pageParameters
    ) {
        log.info("Get all Behadlingens art og omfang");
        Page<BehandlingensArtOgOmfang> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(BehandlingensArtOgOmfangResponse::buildFrom));
    }

    @Operation(summary = "Get One Behadlingens art og omfang")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<BehandlingensArtOgOmfangResponse> getById(@PathVariable UUID id) {
        log.info("Get Behadlingens art og omfang id={}", id);
        return ResponseEntity.ok(BehandlingensArtOgOmfangResponse.buildFrom(service.get(id)));
    }

    @Operation(summary = "Get Behadlingens art og omfang by etterlevelsedokument id")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelsedokument/{etterlevelseDokumentId}")
    public ResponseEntity<BehandlingensArtOgOmfangResponse> getBehandlingensArtOgOmfangResponseByEtterlevelseDokumentId(@PathVariable UUID etterlevelseDokumentId) {
        log.info("Get Behadlingens art og omfang by etterlevelseDokument id={}", etterlevelseDokumentId);
        Optional<BehandlingensArtOgOmfang> behandlingensArtOgOmfang = service.getByEtterlevelseDokumentasjon(etterlevelseDokumentId);

        return behandlingensArtOgOmfang.map(data -> ResponseEntity.ok(BehandlingensArtOgOmfangResponse.buildFrom(data))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create Behadlingens art og omfang")
    @ApiResponse(responseCode = "201", description = "Behadlingens art og omfang created")
    @PostMapping
    public ResponseEntity<BehandlingensArtOgOmfangResponse> createBehandlingensArtOgOmfang(@RequestBody BehandlingensArtOgOmfangRequest request) {
        log.info("Create Behadlingens art og omfang");

        var behandlingensArtOgOmfang = service.save(request.convertToBehandlingensArtOgOmfang(), request.isUpdate());

        return new ResponseEntity<>(BehandlingensArtOgOmfangResponse.buildFrom(behandlingensArtOgOmfang), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Behadlingens art og omfang")
    @ApiResponse(description = "Behadlingens art og omfang updated")
    @PutMapping("/{id}")
    public ResponseEntity<BehandlingensArtOgOmfangResponse> updateBehandlingensArtOgOmfang(@PathVariable UUID id, @Valid @RequestBody BehandlingensArtOgOmfangRequest request) {
        log.info("Update Behadlingens art og omfang id={}", id);

        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var behandlingensArtOgOmfangToUpdate = service.get(id);

        if (behandlingensArtOgOmfangToUpdate == null) {
            throw new ValidationException(String.format("Could not find Behadlingens art og omfang to be updated with id = %s ", id));
        }

        request.mergeInto(behandlingensArtOgOmfangToUpdate);
        var behandlingensArtOgOmfang = service.save(behandlingensArtOgOmfangToUpdate, request.isUpdate());
        return ResponseEntity.ok(BehandlingensArtOgOmfangResponse.buildFrom(behandlingensArtOgOmfang));
    }

    @Operation(summary = "Delete Behadlingens art og omfang")
    @ApiResponse(description = "Behadlingens art og omfang deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<BehandlingensArtOgOmfangResponse> deleteBehandlingensArtOgOmfangById(@PathVariable UUID id) {
        log.info("Delete Behadlingens art og omfang id={}", id);
        var behandlingensArtOgOmfang = service.delete(id);
        if (behandlingensArtOgOmfang == null) {
            log.warn("Could not delete Behadlingens art og omfang with id = {}: Non-existing og related to other resources", id);
            throw new ValidationException("Could not delete Behadlingens art og omfang: Non-existing og related to other resources");
        } else {
            return ResponseEntity.ok(BehandlingensArtOgOmfangResponse.buildFrom(behandlingensArtOgOmfang));
        }
    }
}
