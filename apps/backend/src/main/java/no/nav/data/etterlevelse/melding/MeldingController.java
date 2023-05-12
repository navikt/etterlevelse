package no.nav.data.etterlevelse.melding;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.etterlevelse.melding.dto.MeldingRequest;
import no.nav.data.etterlevelse.melding.dto.MeldingResponse;
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

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/melding")
@Tag(name = "Melding", description = "System/Forside meldinger")
public class MeldingController {

    private final MeldingService service;

    @Operation(summary = "Get all meldinger")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<MeldingResponse>> getAll(
            PageParameters pageParameters
    ) {
        log.info("Get all meldinger");
        Page<Melding> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(Melding::toResponse));
    }

    @Operation(summary = "Get melding by id")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<MeldingResponse> getById(
            @PathVariable UUID id
    ) {
        log.info("Get melding by id={}", id);
        return ResponseEntity.ok(service.get(id).toResponse());
    }

    @Operation(summary = "Get melding by type")
    @ApiResponse(description = "ok")
    @GetMapping({"/type/{meldingType}"})
    public ResponseEntity<RestResponsePage<MeldingResponse>> getByMeldingType(
            @PathVariable String meldingType
    ) {
        log.info("Get melding by meldingtype={}", meldingType);
        List<Melding> meldingList = service.getByMeldingType(meldingType);
        return ResponseEntity.ok(new RestResponsePage<>(meldingList).convert(Melding::toResponse));
    }

    @Operation(summary = "Get melding by status")
    @ApiResponse(description = "ok")
    @GetMapping({"/status/{meldingStatus}"})
    public ResponseEntity<RestResponsePage<MeldingResponse>> getByMeldingStatus(
            @PathVariable String meldingStatus
    ) {
        log.info("Get melding by meldingstatus={}", meldingStatus);
        List<Melding> meldingList = service.getByMeldingStatus(meldingStatus);
        return ResponseEntity.ok(new RestResponsePage<>(meldingList).convert(Melding::toResponse));
    }

    @Operation(summary = "Creating melding")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<MeldingResponse> createMelding(@RequestBody MeldingRequest request) {
        log.info("Create melding");
        var melding = service.save(request);
        return new ResponseEntity<>(melding.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update melding")
    @ApiResponse(description = "ok")
    @PutMapping("/{id}")
    public ResponseEntity<MeldingResponse> updateMelding(@PathVariable UUID id, @Valid @RequestBody MeldingRequest request) {
        log.info("Update melding={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var melding = service.save(request);
        return ResponseEntity.ok(melding.toResponse());
    }

    @Operation(summary = "Delete melding")
    @ApiResponse(description = "ok")
    @DeleteMapping("/{id}")
    public ResponseEntity<MeldingResponse> deleteMelding(@PathVariable UUID id) {
        log.info("Delete melding id={}", id);
        var melding = service.delete(id);
        return ResponseEntity.ok(melding.toResponse());
    }

    static class MeldingPage extends RestResponsePage<MeldingResponse> {

    }
}
