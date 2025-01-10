package no.nav.data.pvk.risikoscenario;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.risikoscenario.dto.KravRisikoscenarioRequest;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioRequest;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
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
        log.info("Get all Pvk Document");
        Page<Risikoscenario> page = risikoscenarioService.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(RisikoscenarioResponse::buildFrom));
    }

    @Operation(summary = "Get One Risikoscenario")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<RisikoscenarioResponse> getById(@PathVariable UUID id) {
        log.info("Get Risikoscenario id={}", id);

        var risikoscenario = RisikoscenarioResponse.buildFrom(risikoscenarioService.get(id));
        getKravDataforRelevantKravList(risikoscenario);
        return ResponseEntity.ok(risikoscenario);
    }

    @Operation(summary = "Get Risikoscenario by Pvk Document id")
    @ApiResponse(description = "ok")
    @GetMapping("/pvkdokument/{pvkDokumentId}/{scenarioType}")
    public ResponseEntity<RestResponsePage<RisikoscenarioResponse>> getRisikoscenarioByPvkDokumentId(@PathVariable String pvkDokumentId, @PathVariable RisikoscenarioType scenarioType) {
        log.info("Get Risikoscenario by Pvk Document id={}", pvkDokumentId);
        List<Risikoscenario> risikoscenarioList = risikoscenarioService.getByPvkDokument(pvkDokumentId, scenarioType);
        List<RisikoscenarioResponse> risikoscenarioResponseList = risikoscenarioList.stream().map(RisikoscenarioResponse::buildFrom).toList();

        risikoscenarioResponseList.forEach(this::getKravDataforRelevantKravList);

        return ResponseEntity.ok(new RestResponsePage<>(risikoscenarioResponseList));
    }

    @Operation(summary = "Get Risikoscenario by kravnummer")
    @ApiResponse(description = "ok")
    @GetMapping("/kravnummer/{kravnummer}")
    public ResponseEntity<RestResponsePage<RisikoscenarioResponse>> getRisikoscenarioByKravnummer(@PathVariable String kravnummer) {
        log.info("Get Risikoscenario by kravnummer={}", kravnummer);
        List<Risikoscenario> risikoscenarioList = risikoscenarioService.getByKravNummer(kravnummer);
        List<RisikoscenarioResponse> risikoscenarioResponseList = risikoscenarioList.stream().map(RisikoscenarioResponse::buildFrom).toList();
        risikoscenarioResponseList.forEach(this::getKravDataforRelevantKravList);
        return ResponseEntity.ok(new RestResponsePage<>(risikoscenarioResponseList));
    }

    @Operation(summary = "Create Risikoscenario")
    @ApiResponse(responseCode = "201", description = "Risikoscenario created")
    @PostMapping
    public ResponseEntity<RisikoscenarioResponse> createRisikoscenario(@RequestBody RisikoscenarioRequest request) {
        log.info("Create Risikoscenario");

        var risikoscenario = risikoscenarioService.save(request.convertToRisikoscenario(), request.isUpdate());

        var response = RisikoscenarioResponse.buildFrom(risikoscenario);
        getKravDataforRelevantKravList(response);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Update Risikoscenario")
    @ApiResponse(description = "Risikoscenario updated")
    @PutMapping("/{id}")
    public ResponseEntity<RisikoscenarioResponse> updateRisikoscenario(@PathVariable UUID id, @Valid @RequestBody RisikoscenarioRequest request) {
        log.info("Update Risikoscenario Document id={}", id);

        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }

        var risikoscenarioToUpdate = risikoscenarioService.get(id);

        if (risikoscenarioToUpdate == null) {
            throw new ValidationException(String.format("Could not find risikoscenario to be updated with id = %s ", request.getId()));
        }

        RisikoscenarioRequest updatedRequest = risikoscenarioService.updateRelevantKravListe(request);

        updatedRequest.mergeInto(risikoscenarioToUpdate);
        var risikoscenario = risikoscenarioService.save(risikoscenarioToUpdate, request.isUpdate());

        var response = RisikoscenarioResponse.buildFrom(risikoscenario);
        getKravDataforRelevantKravList(response);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Set krav on risikoscenarioer")
    @ApiResponse(responseCode = "201", description = "Krav set on risikoscenarioer")
    @PutMapping("/update/relevantKrav")
    @Transactional
    public ResponseEntity<List<RisikoscenarioResponse>> updateRelevantKravForRisikoscenarioer(@RequestBody KravRisikoscenarioRequest request) {
        log.info("Update relevantKrav for risikoscenarioer");
        List<RisikoscenarioResponse> response = new ArrayList<>();

        request.getRisikoscenarioIder().forEach(risikoscenarioId -> {
            var risikoscenario = risikoscenarioService.get(UUID.fromString(risikoscenarioId));
            var RelevanteKravNummer = risikoscenario.getRisikoscenarioData().getRelevanteKravNummer();
            RelevanteKravNummer.add(request.getKravnummer());
            risikoscenario.getRisikoscenarioData().setRelevanteKravNummer(RelevanteKravNummer);
            var updatedRisikoscenario = risikoscenarioService.save(risikoscenario, true);
            response.add(RisikoscenarioResponse.buildFrom(updatedRisikoscenario));
        });

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete Risikoscenario")
    @ApiResponse(description = "Risikoscenario deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<RisikoscenarioResponse> deleteRisikoscenarioById(@PathVariable UUID id) {
        log.info("Delete Risikoscenario id={}", id);
        var risikoscenario = risikoscenarioService.delete(id);
        if (risikoscenario == null) {
            log.warn("Could not find risikoscenario with id = {} to delete", id);
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(RisikoscenarioResponse.buildFrom(risikoscenario));
        }
    }

    @Operation(summary = "Remove krav from risikoscenario")
    @ApiResponse(description = "krav removed form risikoscenario")
    @DeleteMapping("/{id}/{kravnummer}")
    public ResponseEntity<RisikoscenarioResponse> removeKravFromRisikoscenarioById(@PathVariable String id, @PathVariable Integer kravnummer) {
        log.info("Remove krav from risikoscenario id={} with kravnummer={}", id, kravnummer);
        var risikoscenario = risikoscenarioService.get(UUID.fromString(id));
        var RelevanteKravNummer = risikoscenario.getRisikoscenarioData().getRelevanteKravNummer().stream().filter(relevantKrav -> !relevantKrav.equals(kravnummer)).toList();
        risikoscenario.getRisikoscenarioData().setRelevanteKravNummer(RelevanteKravNummer);
        var updatedRisikoscenario = risikoscenarioService.save(risikoscenario, true);
        return ResponseEntity.ok(RisikoscenarioResponse.buildFrom(updatedRisikoscenario));
    }


    private void getKravDataforRelevantKravList(RisikoscenarioResponse risikoscenario) {
        if (!risikoscenario.getRelevanteKravNummer().isEmpty()) {
            risikoscenario.getRelevanteKravNummer().forEach(kravShort -> {
                List<Krav> kravList = kravService.findByKravNummerAndActiveStatus(kravShort.getKravNummer());
                kravShort.setKravVersjon(kravList.get(0).getKravVersjon());
                kravShort.setNavn(kravList.get(0).getNavn());
            });
        }
    }
}
