package no.nav.data.pvk.risikoscenario;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravReference;
import no.nav.data.etterlevelse.krav.dto.RegelverkResponse;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.risikoscenario.dto.KravRisikoscenarioRequest;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioRequest;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import no.nav.data.pvk.tiltak.dto.RisikoscenarioTiltakRequest;
import org.springframework.dao.DataIntegrityViolationException;
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
@RequestMapping("/risikoscenario")
@Tag(name = "Risikoscenario", description = "Risikoscenario for PVK dokument")
public class RisikoscenarioController {

    private final RisikoscenarioService risikoscenarioService;
    private final KravService kravService;

    @Operation(summary = "Get All Risikoscenario")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<RisikoscenarioResponse>> getAll(
            PageParameters pageParameters
    ) {
        log.info("Get all Risikoscenario");
        Page<Risikoscenario> page = risikoscenarioService.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(RisikoscenarioResponse::buildFrom));
    }

    @Operation(summary = "Get One Risikoscenario")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<RisikoscenarioResponse> getById(@PathVariable UUID id) {
        log.info("Get Risikoscenario id={}", id);
        Risikoscenario risikoscenario = risikoscenarioService.get(id);
        if (risikoscenario == null) {
            log.warn("Could not find risikoscenario with id = {}", id);
            throw new NotFoundException(String.format("Could not find risikoscenario with id = %s", id));
        }
        RisikoscenarioResponse resp = RisikoscenarioResponse.buildFrom(risikoscenario);
        setTiltakAndKravDataForRelevantKravList(resp);
        return ResponseEntity.ok(resp);
    }

    @Operation(summary = "Get Risikoscenario by Pvk Document id")
    @ApiResponse(description = "ok")
    @GetMapping("/pvkdokument/{pvkDokumentId}/{scenarioType}")
    public ResponseEntity<RestResponsePage<RisikoscenarioResponse>> getRisikoscenarioByPvkDokumentId(@PathVariable String pvkDokumentId, @PathVariable RisikoscenarioType scenarioType) {
        log.info("Get Risikoscenario by Pvk Document id={}", pvkDokumentId);
        List<Risikoscenario> risikoscenarioList = risikoscenarioService.getByPvkDokument(pvkDokumentId, scenarioType);
        List<RisikoscenarioResponse> risikoscenarioResponseList = risikoscenarioList.stream().map(RisikoscenarioResponse::buildFrom).toList();
        risikoscenarioResponseList.forEach(this::setTiltakAndKravDataForRelevantKravList);
        return ResponseEntity.ok(new RestResponsePage<>(risikoscenarioResponseList));
    }

    @Operation(summary = "Get Risikoscenario by kravnummer")
    @ApiResponse(description = "ok")
    @GetMapping("/kravnummer/{kravnummer}")
    public ResponseEntity<RestResponsePage<RisikoscenarioResponse>> getRisikoscenarioByKravnummer(@PathVariable Integer kravnummer) {
        log.info("Get Risikoscenario by kravnummer={}", kravnummer);
        List<Risikoscenario> risikoscenarioList = risikoscenarioService.getByKravNummer(kravnummer);
        List<RisikoscenarioResponse> risikoscenarioResponseList = risikoscenarioList.stream().map(RisikoscenarioResponse::buildFrom).toList();
        risikoscenarioResponseList.forEach(this::setTiltakAndKravDataForRelevantKravList);
        return ResponseEntity.ok(new RestResponsePage<>(risikoscenarioResponseList));
    }

    @Operation(summary = "Create Risikoscenario")
    @ApiResponse(responseCode = "201", description = "Risikoscenario created")
    @PostMapping
    public ResponseEntity<RisikoscenarioResponse> createRisikoscenario(@RequestBody RisikoscenarioRequest request) {
        log.info("Create Risikoscenario");

        try {
            Risikoscenario risikoscenario = risikoscenarioService.save(request.convertToRisikoscenario(), false);
            RisikoscenarioResponse response = RisikoscenarioResponse.buildFrom(risikoscenario);
            setTiltakAndKravDataForRelevantKravList(response);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            log.warn("DataIntegrityViolationException caught while creating Risikoscenario. Probably reference to non-existing PvkDokument");
            throw new ValidationException("Could not insert Risikoscenario: non-existing PvkDokument");
        }
    }

    @Operation(summary = "Create Risikoscenario knyttet til krav")
    @ApiResponse(responseCode = "201", description = "Risikoscenario knyttet til krav created")
    @PostMapping("/krav/{kravnummer}")
    public ResponseEntity<RisikoscenarioResponse> createRisikoscenarioKnyttetTilKrav(@PathVariable Integer kravnummer , @RequestBody RisikoscenarioRequest request) {
        log.info("Create Risikoscenario knyttet til krav");

        if (!kravService.isActiveKrav(kravnummer)) {
            log.warn("Requested to create Risikoscenario with reference to non-existing Krav");
            throw new ValidationException("Could not insert Risikoscenario: non-existing Krav");
        }
        
        try {
            Risikoscenario risikoscenario = request.convertToRisikoscenario();
            risikoscenario.getRisikoscenarioData().getRelevanteKravNummer().add(kravnummer);
            risikoscenario = risikoscenarioService.save(risikoscenario, false);

            var response = RisikoscenarioResponse.buildFrom(risikoscenario);
            setTiltakAndKravDataForRelevantKravList(response);

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            log.warn("DataIntegrityViolationException caught while creating Risikoscenario. Probably reference to non-existing PvkDokument");
            throw new ValidationException("Could not insert Risikoscenario: non-existing PvkDokument");
        }
    }

    @Operation(summary = "Update Risikoscenario")
    @ApiResponse(description = "Risikoscenario updated")
    @PutMapping("/{id}")
    public ResponseEntity<RisikoscenarioResponse> updateRisikoscenario(@PathVariable UUID id, @Valid @RequestBody RisikoscenarioRequest request) {
        log.info("Update Risikoscenario Document id={}", id);

        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var risikoscenarioToUpdate = risikoscenarioService.get(id);

        if (risikoscenarioToUpdate == null) { 
            throw new NotFoundException(String.format("Could not find risikoscenario to be updated with id = %s ", id));
        }

        if (request.isGenerelScenario() && !risikoscenarioToUpdate.getRisikoscenarioData().isGenerelScenario()) {
            risikoscenarioToUpdate.getRisikoscenarioData().setRelevanteKravNummer(List.of());
        }

        request.mergeInto(risikoscenarioToUpdate);
        var risikoscenario = risikoscenarioService.save(risikoscenarioToUpdate, true);
        var response = RisikoscenarioResponse.buildFrom(risikoscenario);
        setTiltakAndKravDataForRelevantKravList(response);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete Risikoscenario")
    @ApiResponse(description = "Risikoscenario deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<RisikoscenarioResponse> deleteRisikoscenarioById(@PathVariable UUID id) {
        log.info("Delete Risikoscenario id={}", id);
        Risikoscenario risikoscenario;
        try {
            risikoscenario = risikoscenarioService.delete(id);
        } catch (DataIntegrityViolationException e) {
            log.warn("Could delete Risikoscenario with id = {}: Risikoscenario is related to one or more Tiltak", id);
            throw new ValidationException("Could delete Risikoscenario: Risikoscenario is related to one or more Tiltak");
        }
        if (risikoscenario == null) {
            log.warn("Could not find risikoscenario with id = {} to delete", id);
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(RisikoscenarioResponse.buildFrom(risikoscenario));
        }
    }

    @Operation(summary = "Add krav to risikoscenarioer")
    @ApiResponse(responseCode = "201", description = "Krav added to risikoscenarioer")
    @PutMapping("/update/addRelevantKrav")
    public ResponseEntity<List<RisikoscenarioResponse>> addRelevantKravToRisikoscenarioer(@RequestBody KravRisikoscenarioRequest request) {
        log.info("Add relevantKrav for risikoscenarioer");

        if (!kravService.isActiveKrav(request.getKravnummer())) {
            log.warn("Requested to add non-existing or non-active Krav to Risikoscenario");
            return ResponseEntity.badRequest().build(); // Somehow we may get client-side MismatchedInputException if we just throw ValidationException here
        }
        
        // Note: The following will cause NPE (and INTERNAL SE) if a request contains non-existing risikoscenarios. 
        List<Risikoscenario> updatedRisikoscenarioer =  risikoscenarioService.addRelevantKravToRisikoscenarioer(request.getKravnummer(), request.getRisikoscenarioIder());
        
        List<RisikoscenarioResponse> reply = updatedRisikoscenarioer.stream().map(RisikoscenarioResponse::buildFrom).toList();
        reply.forEach(this::setTiltakAndKravDataForRelevantKravList);

        return ResponseEntity.ok(reply);
    }

    @Operation(summary = "Remove krav from risikoscenario")
    @ApiResponse(description = "krav removed form risikoscenario")
    @PutMapping("/{id}/removeKrav/{kravnummer}")
    public ResponseEntity<RisikoscenarioResponse> removeKravFromRisikoscenarioById(@PathVariable String id, @PathVariable Integer kravnummer) {
        log.info("Remove krav {} from risikoscenario id={}", kravnummer, id);
        var risikoscenario = risikoscenarioService.get(UUID.fromString(id));
        List<Integer> relevanteKravNummer = risikoscenario.getRisikoscenarioData().getRelevanteKravNummer();
        if (relevanteKravNummer.remove(kravnummer)) {
            var updatedRisikoscenario = risikoscenarioService.save(risikoscenario, true);
            RisikoscenarioResponse response = RisikoscenarioResponse.buildFrom(updatedRisikoscenario);
            setTiltakAndKravDataForRelevantKravList(response);
            return ResponseEntity.ok(response);
        } else {
            log.warn("Could not remove Krav from Risikoscenario: Krav is not related to Risikoscenario");
            throw new ValidationException("Could not remove Krav from Risikoscenario: Krav is not related to Risikoscenario");
        }
    }

    @Operation(summary = "Add tiltak to risikoscenario")
    @ApiResponse(responseCode = "201", description = "Tiltak added to risikoscenario")
    @PutMapping("/update/addRelevanteTiltak")
    public ResponseEntity<RisikoscenarioResponse> updateRisikoscenarioAddTiltak(@RequestBody RisikoscenarioTiltakRequest request) {
        log.info("Add Tiltak to risikoscenario id={}", request.getRisikoscenarioId());
        try {
            Risikoscenario risikoscenario = risikoscenarioService.addTiltak(request.getRisikoscenarioId(), request.getTiltakIds());
            RisikoscenarioResponse response = RisikoscenarioResponse.buildFrom(risikoscenario);
            setTiltakAndKravDataForRelevantKravList(response);
            return ResponseEntity.ok(response);
        } catch (DataIntegrityViolationException e) {
            // Eigther non-existing, or relation already exists
            log.warn("DataIntegrityViolationException caught while inserting Tiltak-Risikoscenario relation");
            throw new ValidationException("Could not insert Tiltak-Risikoscenario relation: non-existing Tiltak and/or Risikoscenario or relation already exists");
        }
    }

    @Operation(summary = "Remove tiltak from risikoscenario")
    @ApiResponse(description = "Tiltak removed form risikoscenario")
    @PutMapping("/{id}/removeTiltak/{tiltakId}")
    public ResponseEntity<RisikoscenarioResponse> removeTiltakFromRisikoscenarioById(@PathVariable UUID id, @PathVariable UUID tiltakId) {
        log.info("Remove Tiltak (id={}) from risikoscenario (id={})", tiltakId, id);
        if (risikoscenarioService.removeTiltak(id, tiltakId)) {
            RisikoscenarioResponse response = RisikoscenarioResponse.buildFrom(risikoscenarioService.updateTiltakOppdatertField(id, true));
            setTiltakAndKravDataForRelevantKravList(response);
            return ResponseEntity.ok(response);
        } else {
            log.warn("Could not remove Tiltak from Risikoscenario: Tiltak is not related to Risikoscenario");
            throw new ValidationException("Could not remove Tiltak from Risikoscenario: Tiltak is not related to Risikoscenario");
        }
    }

    public void setTiltakAndKravDataForRelevantKravList(RisikoscenarioResponse risikoscenario) {
        // Set Tiltak...
        risikoscenario.setTiltakIds(risikoscenarioService.getTiltak(risikoscenario.getId()));

        // Set KravData...
            risikoscenario.getRelevanteKravNummer().forEach(kravShort -> {
                List<Krav> kravList = kravService.findByKravNummerAndActiveStatus(kravShort.getKravNummer());
                if (kravList.isEmpty()) {
                    kravShort.setNavn("Utgatt krav");
                } else {
                    try {
                        RegelverkResponse regelverk = kravList.get(0).getRegelverk().get(0).toResponse();
                        JsonNode lovData = regelverk.getLov().getData();
                        kravShort.setTemaCode(lovData.get("tema").asText());
                    } catch (RuntimeException e) {
                        // Ignore. If something went wrong (IOOBE or NPE), temaCode is not set.
                    }
                    kravShort.setKravVersjon(kravList.get(0).getKravVersjon());
                    kravShort.setNavn(kravList.get(0).getNavn());
                }
            });

            List<KravReference> filteredKravReference = risikoscenario.getRelevanteKravNummer().stream().filter(kravReference -> !Objects.equals(kravReference.getNavn(), "Utgatt krav")).toList();
            risikoscenario.setRelevanteKravNummer(filteredKravReference);
    }

}
