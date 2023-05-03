package no.nav.data.etterlevelse.krav;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingStatus;
import no.nav.data.etterlevelse.krav.dto.CreateTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.EditTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingNewMeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/tilbakemelding")
@Tag(name = "Tilbakemelding", description = "Tilbakemelding for krav")
@RequiredArgsConstructor
public class TilbakemeldingController {

    private final TilbakemeldingService tilbakemeldingService;

    // Tilbakemelding

    @Operation(summary = "Create Tilbakemelding")
    @ApiResponse(responseCode = "201", description = "Tilbakemelding created")
    @PostMapping
    public ResponseEntity<TilbakemeldingResponse> createTilbakemelding(@RequestBody CreateTilbakemeldingRequest request) {
        log.info("Create Tilbakemelding");
        var tilbakemelding = tilbakemeldingService.create(request);
        return new ResponseEntity<>(tilbakemelding.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "New Melding on Tilbakemelding")
    @ApiResponse(description = "Melding added")
    @PostMapping("/melding")
    public ResponseEntity<TilbakemeldingResponse> tilbakemeldingNewMelding(@RequestBody TilbakemeldingNewMeldingRequest request) {
        log.info("New Melding on Tilbakemelding");
        var tilbakemelding = tilbakemeldingService.newMelding(request);
        return ResponseEntity.ok(tilbakemelding.toResponse());
    }

    @Operation(summary = "Delete Melding on Tilbakemelding")
    @ApiResponse(description = "Melding deleted")
    @DeleteMapping("/{tilbakemeldingId}/{meldingNr}")
    public ResponseEntity<TilbakemeldingResponse> tilbakemeldingDeleteMelding(@PathVariable UUID tilbakemeldingId, @PathVariable int meldingNr) {
        log.info("Slett Melding on Tilbakemelding");
        var tilbakemelding = tilbakemeldingService.deleteMelding(tilbakemeldingId, meldingNr);
        return ResponseEntity.ok(tilbakemelding.toResponse());
    }

    @Operation(summary = "Edit Melding on Tilbakemelding")
    @ApiResponse(description = "Melding edited")
    @PostMapping("/{tilbakemeldingId}/{meldingNr}")
    public ResponseEntity<TilbakemeldingResponse> tilbakemeldingEditMelding(@PathVariable UUID tilbakemeldingId, @PathVariable int meldingNr, @RequestBody EditTilbakemeldingRequest req) {
        log.info("Edit Melding on Tilbakemelding");
        var tilbakemelding = tilbakemeldingService.editMelding(tilbakemeldingId, meldingNr, req.getInnhold());
        return ResponseEntity.ok(tilbakemelding.toResponse());
    }

    @Operation(summary = "Get Tilbakemeldinger for krav and version")
    @ApiResponse(description = "Tilbakemeldinger for krav and version")
    @GetMapping("/{kravNummer}/{kravVersjon}")
    public ResponseEntity<RestResponsePage<TilbakemeldingResponse>> getTilbakemeldinger(@PathVariable int kravNummer, @PathVariable int kravVersjon) {
        log.info("Get Tilbakemeldinger for krav K{}.{}", kravNummer, kravVersjon);
        var tilbakemeldinger = tilbakemeldingService.getForKravByNumberAndVersion(kravNummer, kravVersjon);
        return ResponseEntity.ok(new RestResponsePage<>(tilbakemeldinger).convert(Tilbakemelding::toResponse));
    }

    @Operation(summary = "Get Tilbakemeldinger for krav by krav nummer")
    @ApiResponse(description = "Tilbakemeldinger for krav by krav nummer")
    @GetMapping("/{kravNummer}")
    public ResponseEntity<RestResponsePage<TilbakemeldingResponse>> getTilbakemeldingerByKravNummer(@PathVariable int kravNummer) {
        log.info("Get Tilbakemeldinger for krav K{}", kravNummer);
        var tilbakemeldinger = tilbakemeldingService.getForKravByNumber(kravNummer);
        return ResponseEntity.ok(new RestResponsePage<>(tilbakemeldinger).convert(Tilbakemelding::toResponse));
    }

    @Operation(summary = "Change status and endretKrav")
    @ApiResponse(description = "Update status and endretKrav for tilbakemelding")
    @PostMapping("/status/{tilbakeMeldingId}/{status}/{endretkrav}")
    public ResponseEntity<TilbakemeldingResponse> updateTilbakemeldingStatusAndEndretKrav(@PathVariable UUID tilbakeMeldingId, @PathVariable TilbakemeldingStatus status, @PathVariable boolean endretkrav) {
        log.info("Update tilbakemelding status");
        var tilbakemelding = tilbakemeldingService.updateTilbakemeldingStatusAndEndretKrav(tilbakeMeldingId, status, endretkrav);
        return ResponseEntity.ok(tilbakemelding.toResponse());
    }

    static class TilbakemeldingPage extends RestResponsePage<TilbakemeldingResponse> {

    }

}
