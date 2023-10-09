package no.nav.data.etterlevelse.etterlevelse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/etterlevelse")
@Tag(name = "Etterlevelse", description = "Etterlevelse for behandlinger")
public class  EtterlevelseController {


    private final EtterlevelseService service;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    @Operation(summary = "Get All Etterlevelse")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getAll(
            PageParameters pageParameters,
            @RequestParam(required = false) String etterlevelseDokumentasjon
    ) {
        if (etterlevelseDokumentasjon != null) {
            log.info("Get all Etterlevelse for behandling={}", etterlevelseDokumentasjon);
            List<Etterlevelse> etterlevelseList = service.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon);
            return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(Etterlevelse::toResponse));
        }
        log.info("Get all Etterlevelse");
        Page<Etterlevelse> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(Etterlevelse::toResponse));
    }

    @Operation(summary = "Get Etterlevelse by KravNummer and KravVersjon, include etterlevelse dokumentajson metadata")
    @ApiResponse(description = "ok")
    @GetMapping({"/kravnummer/{kravNummer}/{kravVersjon}", "/kravnummer/{kravNummer}"})
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getById(@PathVariable Integer kravNummer, @PathVariable(required = false) Integer kravVersjon) {
        log.info("Get Etterlevelse for kravNummer={}", kravNummer);
        List<Etterlevelse> etterlevelseList = service.getByKravNummer(kravNummer, kravVersjon);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(this::toResponseWithEtterlevelseDokumentasjon));
    }

    private EtterlevelseResponse toResponseWithEtterlevelseDokumentasjon(Etterlevelse etterlevelse) {
        EtterlevelseResponse response = etterlevelse.toResponse();
        if(response.getEtterlevelseDokumentasjonId() != null && !response.getEtterlevelseDokumentasjonId().isEmpty())  {
            response.setEtterlevelseDokumentasjon(etterlevelseDokumentasjonService.get(UUID.fromString(response.getEtterlevelseDokumentasjonId())).toResponse());
        }
        return response;
    }

    @Operation(summary = "Get One Etterlevelse")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<EtterlevelseResponse> getById(@PathVariable UUID id) {
        log.info("Get Etterlevelse id={}", id);
        return ResponseEntity.ok(service.get(id).toResponse());
    }

    @Operation(summary = "Get Etterlevelse by etterlevelseDokumentasjonId and KravNummer")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelseDokumentasjon/{etterlevelseDokumentasjonId}/{kravNummer}")
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getByEtterlevelseDokumentasjonIdAndKravNummer(@PathVariable String etterlevelseDokumentasjonId, @PathVariable Integer kravNummer) {
        log.info("Get Etterlevelse by etterlevelseDokumentasjonId={} and kravNummer={}", etterlevelseDokumentasjonId, kravNummer);
        List<Etterlevelse> etterlevelseList = service.getByEtterlevelseDokumentasjonIdAndKravNummer(etterlevelseDokumentasjonId, kravNummer);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(Etterlevelse::toResponse));
    }

    @Operation(summary = "Get Etterlevelse by etterlevelsedokumentasjonId")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelsedokumentasjon/{etterlevelseDokumentasjonId}")
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getByEtterlevelseDokumentasjonId(@PathVariable String etterlevelseDokumentasjonId) {
        log.info("Get Etterlevelse by etterlevelseDokumentasjonsId={}", etterlevelseDokumentasjonId);
        List<Etterlevelse> etterlevelseList = service.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(Etterlevelse::toResponse));
    }

    @Operation(summary = "Create Etterlevelse")
    @ApiResponse(responseCode = "201", description = "Etterlevelse created")
    @PostMapping
    public ResponseEntity<EtterlevelseResponse> createEtterlevelse(@RequestBody EtterlevelseRequest request) {
        log.info("Create Etterlevelse");

        if(request.getEtterlevelseDokumentasjonId() == null || request.getEtterlevelseDokumentasjonId().isEmpty()) {
            throw new ValidationException("Tried to create etterlevelse with old architecture");
        }

        var krav = service.save(request);
        return new ResponseEntity<>(krav.toResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Etterlevelse")
    @ApiResponse(description = "Etterlevelse updated")
    @PutMapping("/{id}")
    public ResponseEntity<EtterlevelseResponse> updateEtterlevelse(@PathVariable UUID id, @Valid @RequestBody EtterlevelseRequest request) {
        log.debug("Update Etterlevelse id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        if(request.getEtterlevelseDokumentasjonId() == null || request.getEtterlevelseDokumentasjonId().isEmpty()) {
            throw new ValidationException("Tried to create etterlevelse with old architecture");
        }

        var etterlevelse = service.save(request);
        return ResponseEntity.ok(etterlevelse.toResponse());
    }

    @Operation(summary = "Delete Etterlevelse")
    @ApiResponse(description = "Etterlevelse deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<EtterlevelseResponse> deleteEtterlevelseById(@PathVariable UUID id) {
        log.info("Delete Etterlevelse id={}", id);
        var etterlevelse = service.delete(id);
        return ResponseEntity.ok(etterlevelse.toResponse());
    }

    static class EtterlevelsePage extends RestResponsePage<EtterlevelseResponse> {

    }
}
