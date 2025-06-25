package no.nav.data.etterlevelse.etterlevelsemetadata;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/etterlevelsemetadata")
@Tag(name = "Etterlevelsemetadata", description = "Etterlevelsemetadata")
public class EtterlevelseMetadataController {

    private final EtterlevelseMetadataService service;

    @Operation(summary = "Get all etterlevelsemetadata")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<EtterlevelseMetadataResponse>> getAll(
            PageParameters pageParameters
    ) {
        log.info("Get all etterlevelsemetadata");
        Page<EtterlevelseMetadata> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(EtterlevelseMetadataResponse::buildFrom));
    }

    @Operation(summary = "Get etterlevelsemetadata by id")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<EtterlevelseMetadataResponse> getById(
            @PathVariable UUID id
    ) {
        log.info("Get etterlevelsemetadata by id={}", id);
        EtterlevelseMetadata etMet = service.get(id);
        if (etMet == null) {
            log.warn("No EtterlevelseMetadata with id={}", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(EtterlevelseMetadataResponse.buildFrom(etMet));
    }

    @Operation(summary = "Get etterlevelsemetadata by KravNummer and KravVersjon")
    @ApiResponse(description = "ok")
    @GetMapping({"/kravnummer/{kravNummer}/{kravVersjon}", "/kravnummer/{kravNummer}"})
    public ResponseEntity<RestResponsePage<EtterlevelseMetadataResponse>> getByKravNummerAndKravVersjon(
            @PathVariable Integer kravNummer,
            @PathVariable(required = false) Integer kravVersjon
    ) {
        log.info("Get etterlevelsemetadata for kravnummer={}", kravNummer);
        List<EtterlevelseMetadata> etterlevelseMetadataList = service.getByKravNummer(kravNummer, kravVersjon);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseMetadataList).convert(EtterlevelseMetadataResponse::buildFrom));
    }

    @Operation(summary = "Get etterlevelsemetadata by etterlevelseDokumentasjonId")
    @ApiResponse(description = "ok")
    @GetMapping({"/etterlevelseDokumentasjon/{etterlevelseDokumentasjonId}"})
    public ResponseEntity<RestResponsePage<EtterlevelseMetadataResponse>> getByEtterlevelseDokumnetasjonId(
            @PathVariable UUID etterlevelseDokumentasjonId
    ) {
        log.info("Get etterlevelsemetadatafor etterlevelseDokumentasjonId={}", etterlevelseDokumentasjonId);
        List<EtterlevelseMetadata> etterlevelseMetadataList = service.getByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseMetadataList).convert(EtterlevelseMetadataResponse::buildFrom));
    }

    @Operation(summary = "Get etterlevelsemetadata by etterlevelseDokumentasjon and krav")
    @ApiResponse(description = "ok")
    @GetMapping({"/etterlevelseDokumentasjon/{etterlevelseDokumentasjonId}/{kravNummer}/{kravVersjon}" , "/etterlevelseDokumentasjon/{etterlevelseDokumentasjonId}/{kravNummer}"})
    public ResponseEntity<RestResponsePage<EtterlevelseMetadataResponse>> getByEtterlevelseDokumentasjonAndKrav(
            @PathVariable UUID etterlevelseDokumentasjonId,
            @PathVariable Integer kravNummer,
            @PathVariable(required = false) Integer kravVersjon
    ) {
        log.info("Get etterlevelsemetadatafor etterlevelseDokumentasjonId={}, kravNummer={}", etterlevelseDokumentasjonId, kravNummer);
        List<EtterlevelseMetadata> etterlevelseMetadataList = service.getByEtterlevelseDokumentasjonIdAndKrav(etterlevelseDokumentasjonId, kravNummer, kravVersjon);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseMetadataList).convert(EtterlevelseMetadataResponse::buildFrom));
    }

    @Operation(summary = "Creating etterlevelsemetadata")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<EtterlevelseMetadataResponse> createEtterlevelseMetadata(@RequestBody EtterlevelseMetadataRequest request) {
        log.info("Create etterlevelsemetadata");
        var etterlevelseMetadata = service.save(request);
        return new ResponseEntity<>(EtterlevelseMetadataResponse.buildFrom(etterlevelseMetadata), HttpStatus.CREATED);
    }

    @Operation(summary = "Update etterlevelsemetadata")
    @ApiResponse(description = "ok")
    @PutMapping("/{id}")
    public ResponseEntity<EtterlevelseMetadataResponse> updateEtterlevelseMetadata(
            @PathVariable UUID id, 
            @Valid @RequestBody EtterlevelseMetadataRequest request
    ) {
        log.info("Update EtterlevelseMetadataResponseid={}", id);

        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var etterlevelseMetadata = service.save(request);
        return ResponseEntity.ok(EtterlevelseMetadataResponse.buildFrom(etterlevelseMetadata));
    }

    @Operation(summary = "Delete etterlevelsemetadata")
    @ApiResponse(description = "ok")
    @DeleteMapping("/{id}")
    public ResponseEntity<EtterlevelseMetadataResponse> deleteEtterlevelseMetadata(@PathVariable UUID id) {
        log.info("Delete EtterlevelseMetadataResponse id={}", id);
        var etterlevelseMetadata = service.delete(id);
        return ResponseEntity.ok(EtterlevelseMetadataResponse.buildFrom(etterlevelseMetadata));
    }

    // Used only for unittests
    static class EtterlevelseMetadataPage extends RestResponsePage<EtterlevelseMetadataResponse> {
    }
}
