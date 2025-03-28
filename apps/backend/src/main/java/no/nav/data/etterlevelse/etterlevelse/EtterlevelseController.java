package no.nav.data.etterlevelse.etterlevelse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ForbiddenException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
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
public class EtterlevelseController {


    private final EtterlevelseService service;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    @Operation(summary = "Get All Etterlevelse")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getAll(
            PageParameters pageParameters,
            @RequestParam(required = false) UUID etterlevelseDokumentasjon
    ) {
        if (etterlevelseDokumentasjon != null) {
            log.info("Get all Etterlevelse for behandling={}", etterlevelseDokumentasjon);
            List<Etterlevelse> etterlevelseList = service.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon);
            return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(EtterlevelseResponse::buildFrom));
        }
        log.info("Get all Etterlevelse");
        Page<Etterlevelse> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(EtterlevelseResponse::buildFrom));
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
        EtterlevelseResponse response = EtterlevelseResponse.buildFrom(etterlevelse);
        if (response.getEtterlevelseDokumentasjonId() != null) {
            response.setEtterlevelseDokumentasjon(EtterlevelseDokumentasjonResponse.buildFrom(
                    etterlevelseDokumentasjonService.get(response.getEtterlevelseDokumentasjonId())
            ));
        }
        return response;
    }

    @Operation(summary = "Get One Etterlevelse")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<EtterlevelseResponse> getById(@PathVariable UUID id) {
        log.info("Get Etterlevelse id={}", id);
        return ResponseEntity.ok(EtterlevelseResponse.buildFrom(service.get(id)));
    }

    @Operation(summary = "Get Etterlevelse by etterlevelseDokumentasjonId and KravNummer")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelseDokumentasjon/{etterlevelseDokumentasjonId}/{kravNummer}")
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getByEtterlevelseDokumentasjonIdAndKravNummer(@PathVariable UUID etterlevelseDokumentasjonId, @PathVariable Integer kravNummer) {
        log.info("Get Etterlevelse by etterlevelseDokumentasjonId={} and kravNummer={}", etterlevelseDokumentasjonId, kravNummer);
        List<Etterlevelse> etterlevelseList = service.getByEtterlevelseDokumentasjonIdAndKravNummer(etterlevelseDokumentasjonId, kravNummer);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(EtterlevelseResponse::buildFrom));
    }

    @Operation(summary = "Get Etterlevelse by etterlevelsedokumentasjonId")
    @ApiResponse(description = "ok")
    @GetMapping("/etterlevelsedokumentasjon/{etterlevelseDokumentasjonId}")
    public ResponseEntity<RestResponsePage<EtterlevelseResponse>> getByEtterlevelseDokumentasjonId(@PathVariable UUID etterlevelseDokumentasjonId) {
        log.info("Get Etterlevelse by etterlevelseDokumentasjonsId={}", etterlevelseDokumentasjonId);
        List<Etterlevelse> etterlevelseList = service.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseList).convert(EtterlevelseResponse::buildFrom));
    }

    @Operation(summary = "Create Etterlevelse")
    @ApiResponse(responseCode = "201", description = "Etterlevelse created")
    @PostMapping
    public ResponseEntity<EtterlevelseResponse> createEtterlevelse(@RequestBody EtterlevelseRequest request) {
        log.info("Create Etterlevelse");

        var etterlevelseDokumentasjon = EtterlevelseDokumentasjonResponse.buildFrom(
                etterlevelseDokumentasjonService.get(request.getEtterlevelseDokumentasjonId())
        );
        if (etterlevelseDokumentasjon.getTeams().isEmpty() && etterlevelseDokumentasjon.getResources().isEmpty()) {
            log.info("PriorityList is Empty. Requested to save without user or team added to Etterlevelse document.");
            throw new ForbiddenException("Har du lagt til team og eller person i dokument egenskaper? Dette er nødvendig for å lagre endringer.");
        }

        if (request.getEtterlevelseDokumentasjonId() == null) {
            throw new ValidationException("Tried to create etterlevelse with old architecture");
        }

        etterlevelseDokumentasjonService.updatePriorityList(request.getEtterlevelseDokumentasjonId(), request.getKravNummer(), request.isPrioritised());

        var etterlevelse = service.save(request);
        return new ResponseEntity<>(EtterlevelseResponse.buildFrom(etterlevelse), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Etterlevelse")
    @ApiResponse(description = "Etterlevelse updated")
    @PutMapping("/{id}")
    public ResponseEntity<EtterlevelseResponse> updateEtterlevelse(@PathVariable UUID id, @Valid @RequestBody EtterlevelseRequest request) {
        log.debug("Update Etterlevelse id={}", id);
        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        if (request.getEtterlevelseDokumentasjonId() == null) {
            throw new ValidationException("Tried to create etterlevelse with old architecture");
        }

        var etterlevelseDokumentasjon = EtterlevelseDokumentasjonResponse.buildFrom(
                etterlevelseDokumentasjonService.get(request.getEtterlevelseDokumentasjonId())
        );
        if (etterlevelseDokumentasjon.getTeams().isEmpty() && etterlevelseDokumentasjon.getResources().isEmpty()) {
            log.info("Requested to save without user or team added to Etterlevelse document.");
            throw new ForbiddenException("Har du lagt til team og eller person i dokument egenskaper? Dette er nødvendig for å lagre endringer.");
        }

        etterlevelseDokumentasjonService.updatePriorityList(request.getEtterlevelseDokumentasjonId(), request.getKravNummer(), request.isPrioritised());

        var etterlevelse = service.save(request);
        return ResponseEntity.ok(EtterlevelseResponse.buildFrom(etterlevelse));
    }

    @Operation(summary = "Delete Etterlevelse")
    @ApiResponse(description = "Etterlevelse deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<EtterlevelseResponse> deleteEtterlevelseById(@PathVariable UUID id) {
        log.info("Delete Etterlevelse id={}", id);
        var etterlevelse = service.delete(id);
        return ResponseEntity.ok(EtterlevelseResponse.buildFrom(etterlevelse));
    }

    static class EtterlevelsePage extends RestResponsePage<EtterlevelseResponse> {

    }
}
