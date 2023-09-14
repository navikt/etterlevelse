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
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
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

import java.util.Collections;
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
    private final BehandlingService behandlingService;

    @Operation(summary = "Get All Etterlevelse")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getAll(
            PageParameters pageParameters,
            @RequestParam(required = false) String behandling
    ) {
        if (behandling != null) {
            log.info("Get all Etterlevelse for behandling={}", behandling);
            List<Etterlevelse> etterlevelseList = service.getByBehandling(behandling);
            return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(Etterlevelse::toResponse));
        }
        log.info("Get all Etterlevelse");
        Page<Etterlevelse> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(Etterlevelse::toResponse));
    }

    @Operation(summary = "Get Etterlevelse by KravNummer and KravVersjon, include behandling")
    @ApiResponse(description = "ok")
    @GetMapping({"/kravnummer/{kravNummer}/{kravVersjon}", "/kravnummer/{kravNummer}"})
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getById(@PathVariable Integer kravNummer, @PathVariable(required = false) Integer kravVersjon) {
        log.info("Get Etterlevelse for kravNummer={}", kravNummer);
        List<Etterlevelse> etterlevelseList = service.getByKravNummer(kravNummer, kravVersjon);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(Etterlevelse::toResponse));
    }

    @Operation(summary = "Get One Etterlevelse")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<EtterlevelseResponse> getById(@PathVariable UUID id) {
        log.info("Get Etterlevelse id={}", id);
        return ResponseEntity.ok(service.get(id).toResponse());
    }

    @Operation(summary = "Get Etterlevelse by BehandlingsId and KravNummer")
    @ApiResponse(description = "ok")
    @GetMapping("/behandling/{behandlingsId}/{kravNummer}")
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getByBehandlingsIdAndKravNummer(@PathVariable String behandlingsId, @PathVariable Integer kravNummer) {
        log.info("Get Etterlevelse by behandlingsId={} and kravNummer={}", behandlingsId, kravNummer);
        List<Etterlevelse> etterlevelseList = service.getByBehandlingsIdAndKravNummer(behandlingsId, kravNummer);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(Etterlevelse::toResponse));
    }


    @Operation(summary = "Get Etterlevelse by etterlevelseDokumentasjonId and KravNummer")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelseDokumentasjon/{etterlevelseDokumentasjonId}/{kravNummer}")
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getByEtterlevelseDokumentasjonIdAndKravNummer(@PathVariable String etterlevelseDokumentasjonId, @PathVariable Integer kravNummer) {
        log.info("Get Etterlevelse by etterlevelseDokumentasjonId={} and kravNummer={}", etterlevelseDokumentasjonId, kravNummer);
        List<Etterlevelse> etterlevelseList = service.getByEtterlevelseDokumentasjonIdAndKravNummer(etterlevelseDokumentasjonId, kravNummer);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(Etterlevelse::toResponse));
    }

    @Operation(summary = "Get Etterlevelse by BehandlingsId")
    @ApiResponse(description = "ok")
    @GetMapping("/behandling/{behandlingsId}")
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getByBehandlingsId(@PathVariable String behandlingsId) {
        log.info("Get Etterlevelse by behandlingsId={}", behandlingsId);
        List<Etterlevelse> etterlevelseList = service.getByBehandling(behandlingsId);
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

    @Operation(summary = "Update Etterlevelse to new behandling")
    @ApiResponse(responseCode = "201", description = "Etterlevelse updated")
    @PostMapping("/update/behandlingid/{oldBehandlingsId}/{newBehandlingsId}")
    public ResponseEntity<String> updateEtterlevelseToNewBehandling(@PathVariable String oldBehandlingsId, @PathVariable String newBehandlingsId) {
        log.info("moving etterlevelse documentations to a new behandling");

        List<Behandling> oldBehandling = behandlingService.findAllById(Collections.singletonList(oldBehandlingsId));
        List<Behandling>  newBehandling = behandlingService.findAllById(Collections.singletonList(newBehandlingsId));

        if(oldBehandling.size() == 0) {
            log.info("Found no behandling with id: " + oldBehandlingsId);
            return new ResponseEntity<>("Unable to find behandling with uid: " + oldBehandlingsId,HttpStatus.BAD_REQUEST);
        }

        if(newBehandling.size() == 0) {
            log.info("Found no behandling with id: " + newBehandlingsId);
            return new ResponseEntity<>("Unable to find behandling with uid: " + newBehandlingsId,HttpStatus.BAD_REQUEST);
        }

        service.updateEtterlevelseToNewBehandling(oldBehandlingsId, newBehandlingsId);

        return new ResponseEntity<>("Successfully updated etterlevelses documetations to new behandlings uid: " + newBehandlingsId,HttpStatus.OK);
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
