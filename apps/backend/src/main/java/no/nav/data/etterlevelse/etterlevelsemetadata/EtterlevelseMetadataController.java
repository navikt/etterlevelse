package no.nav.data.etterlevelse.etterlevelsemetadata;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataResponse;
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

import javax.validation.Valid;
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
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(EtterlevelseMetadata::toResponse));
    }

    @Operation(summary = "Get etterlevelsemetadata by KravNummer and KravVersjon")
    @ApiResponse(description = "ok")
    @GetMapping({"/kravnummer/{kravNummer}/{kravVersjon}", "/kravnummer/{kravNummer}"})
    public ResponseEntity<RestResponsePage<EtterlevelseMetadataResponse>> getByKravNummerAndKravVersjon(
            @PathVariable Integer kravNummer,
            @PathVariable(required = false) Integer kravVersjon
    ) {
        log.info("Get etterlevelsemetadatafor kravnummer={}", kravNummer);
        List<EtterlevelseMetadata> etterlevelseMetadataList = service.getByKravNummer(kravNummer, kravVersjon);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseMetadataList).convert(EtterlevelseMetadata::toResponse));
    }

    @Operation(summary = "Get etterlevelsemetadata by behandlingId")
    @ApiResponse(description = "ok")
    @GetMapping({"/behandlingId/{behandlingId}"})
    public ResponseEntity<RestResponsePage<EtterlevelseMetadataResponse>> getByBehandlingId(
            @PathVariable String behandlingId
    ) {
        log.info("Get etterlevelsemetadatafor behandlingId={}", behandlingId);
        List<EtterlevelseMetadata> etterlevelseMetadataList = service.getByBehandling(behandlingId);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseMetadataList).convert(EtterlevelseMetadata::toResponse));
    }

    @Operation(summary = "Creating etterlevelsemetadata")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<EtterlevelseMetadataResponse> createKravPrioritering(@RequestBody EtterlevelseMetadataRequest request) {
        log.info("Create krav prioritering");
        var ette = service.save(request);
        return new ResponseEntity<>(ette.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update etterlevelsemetadata")
    @ApiResponse(description = "ok")
    @PutMapping("/{id}")
    public ResponseEntity<EtterlevelseMetadataResponse> updateKravPrioritering(@PathVariable UUID id, @Valid @RequestBody EtterlevelseMetadataRequest request) {
        log.info("Update EtterlevelseMetadataResponseid={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var kravPrioritering = service.save(request);
        return ResponseEntity.ok(kravPrioritering.toResponse());
    }

    @Operation(summary = "Delete etterlevelsemetadata")
    @ApiResponse(description = "ok")
    @DeleteMapping("/{id}")
    public ResponseEntity<EtterlevelseMetadataResponse> deleteKravPrioritering(@PathVariable UUID id) {
        log.info("Delete EtterlevelseMetadataResponse id={}", id);
        var etterlevelseMetadata = service.delete(id);
        return ResponseEntity.ok(etterlevelseMetadata.toResponse());
    }

    static class EtterlevelseMetadataPage extends RestResponsePage<EtterlevelseMetadataResponse> {

    }
}
