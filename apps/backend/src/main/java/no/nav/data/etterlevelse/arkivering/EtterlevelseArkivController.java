package no.nav.data.etterlevelse.arkivering;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/etterlevelsearkiv")
@Tag(name = "Etterlevelsearkiv", description = "Etterlevelsearkiv")
public class EtterlevelseArkivController {

    private final EtterlevelseArkivService etterlevelseArkivService;

    @Operation(summary = "Get all etterlevelsearkiv")
    @ApiResponse(description = "Ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all etterlevelsearkiv");
        Page<EtterlevelseArkiv> page = etterlevelseArkivService.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Get etterlevelsearkiv by webSak nummer")
    @ApiResponse(description = "Ok")
    @GetMapping("/websaknummer")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getByWebsakNummer(
            @RequestParam(name="websakNummer") String webSakNummer
    ) {
        log.info("Get etterlevelsearkiv by webSaknummer {}", webSakNummer);
        List<EtterlevelseArkiv> etterlevelseArkivList=etterlevelseArkivService.getByWebsakNummer(webSakNummer);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Get etterlevelsearkiv by TilArkivering")
    @ApiResponse(description = "Ok")
    @GetMapping("/tilarkivering/{tilArkivering}")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getByTilArkivering(@PathVariable Boolean tilArkivering) {
        log.info("Get etterlevelsearkiv by tilArkivering {}", tilArkivering);
        List<EtterlevelseArkiv> etterlevelseArkivList=etterlevelseArkivService.getByTilArkivering(tilArkivering);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Get etterlevelsearkiv by behandlingId")
    @ApiResponse(description = "Ok")
    @GetMapping("/behandling/{behandlinId}")
    public ResponseEntity<RestResponsePage<EtterlevelseArkivResponse>> getByBehandling(@PathVariable String behandlinId) {
        log.info("Get etterlevelsearkiv by behandlinId {}", behandlinId);
        List<EtterlevelseArkiv> etterlevelseArkivList=etterlevelseArkivService.getByBehandling(behandlinId);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseArkivList).convert(EtterlevelseArkiv::toResponse));
    }

    @Operation(summary = "Creating etterlevelseArkiv")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<EtterlevelseArkivResponse> createEtterlevelseArkiv(@RequestBody EtterlevelseArkivRequest request) {
        log.info("Create etterlevelseArkiv");
        var etterlevelseArkiv = etterlevelseArkivService.save(request);
        return new ResponseEntity<>(etterlevelseArkiv.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update etterlevelseArkiv")
    @ApiResponse(description = "ok")
    @PutMapping("/{id}")
    public ResponseEntity<EtterlevelseArkivResponse> updateEtterlevelseMetadata(@PathVariable UUID id, @Valid @RequestBody EtterlevelseArkivRequest request) {
        log.info("Update EtterlevelseArkivResponseid={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var etterlevelseArkiv = etterlevelseArkivService.save(request);
        return ResponseEntity.ok(etterlevelseArkiv.toResponse());
    }

    @Operation(summary = "Delete etterlevelseArkiv")
    @ApiResponse(description = "ok")
    @DeleteMapping("/{id}")
    public ResponseEntity<EtterlevelseArkivResponse> deleteEtterlevelseMetadata(@PathVariable UUID id) {
        log.info("Delete EtterlevelseArkivResponse id={}", id);
        var etterlevelseMetadata = etterlevelseArkivService.delete(id);
        return ResponseEntity.ok(etterlevelseMetadata.toResponse());
    }

    public static class EtterlevelseArkivPage extends RestResponsePage<EtterlevelseArkiv> {

    }
}
