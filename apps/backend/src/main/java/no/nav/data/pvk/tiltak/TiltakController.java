package no.nav.data.pvk.tiltak;

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
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.ResourceType;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.dto.TiltakRequest;
import no.nav.data.pvk.tiltak.dto.TiltakResponse;
import org.springframework.dao.DataIntegrityViolationException;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/tiltak")
@Tag(name = "Tiltak", description = "Tiltak for Pvk")
public class TiltakController {

    private final TiltakService service;
    private final TeamcatResourceClient teamcatResourceClient;

    @Operation(summary = "Get All Tiltak")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<TiltakResponse>> getAll(PageParameters pageParameters) {
        log.info("Get all Tiltak");
        Page<Tiltak> page = service.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(page).convert(TiltakResponse::buildFrom));
    }
    
    @Operation(summary = "Get One Tiltak")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<TiltakResponse> getById(@PathVariable UUID id) {
        log.info("Get Tiltak id={}", id);
        TiltakResponse resp = TiltakResponse.buildFrom(service.get(id));
        addRisikoscenarioer(resp);
        addResourceData(resp);
        return ResponseEntity.ok(resp);
    }

    @Operation(summary = "Get Tiltak by Pvk Document id")
    @ApiResponse(description = "ok")
    @GetMapping("/pvkdokument/{pvkDokumentId}")
    public ResponseEntity<RestResponsePage<TiltakResponse>> getTiltakByPvkDokumentId(@PathVariable String pvkDokumentId) {
        log.info("Get Tiltak by Pvk Document id={}", pvkDokumentId);
        List<Tiltak> tiltakList = service.getByPvkDokument(pvkDokumentId);
        List<TiltakResponse> tiltakResponseList = tiltakList.stream().map(TiltakResponse::buildFrom).toList();
        tiltakResponseList.forEach(tiltakResponse -> {
            addRisikoscenarioer(tiltakResponse);
            addResourceData(tiltakResponse);
        });
        return ResponseEntity.ok(new RestResponsePage<>(tiltakResponseList));
    }

    @Operation(summary = "Create Tiltak")
    @ApiResponse(responseCode = "201", description = "Tiltak created")
    @PostMapping("/risikoscenario/{risikoscenarioId}")
    public ResponseEntity<TiltakResponse> createTiltak(@PathVariable UUID risikoscenarioId, @RequestBody TiltakRequest request) {
        log.info("Create Tiltak");
        Tiltak tiltak = service.save(request.convertToTiltak(), false);
        service.addRisikoscenarioTiltakRelasjon(risikoscenarioId.toString(), tiltak.getId().toString());
        TiltakResponse resp = TiltakResponse.buildFrom(tiltak);
        addRisikoscenarioer(resp);
        addResourceData(resp);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    @Operation(summary = "Update tiltak")
    @ApiResponse(description = "Tiltak updated")
    @PutMapping("/{id}")
    public ResponseEntity<TiltakResponse> updateTiltak(@PathVariable String id, @Valid @RequestBody TiltakRequest request) {
        log.info("Update tiltak id={}", id);

        if (!Objects.equals(id, request.getId())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        Tiltak tiltakToUpdate = service.get(UUID.fromString(id));
        if (tiltakToUpdate == null) {
            throw new NotFoundException(String.format("Could not find tiltak to be updated with id = %s ", request.getId()));
        }

        request.mergeInto(tiltakToUpdate);
        Tiltak tiltak = service.save(tiltakToUpdate, true);
        var response = TiltakResponse.buildFrom(tiltak);
        addRisikoscenarioer(response);
        addResourceData(response);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete tiltak")
    @ApiResponse(description = "tiltak deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<TiltakResponse> deleteTiltakById(@PathVariable UUID id) {
        log.info("Delete tiltak id={}", id);
        Tiltak tiltak;
        try {
            tiltak = service.delete(id);
        } catch (DataIntegrityViolationException e) {
            log.warn("Could delete Tiltak with id = {}: Tiltak is related to one or more Risikoscenario", id);
            throw new ValidationException("Could delete Tiltak: Tiltak is related to one or more Risikoscenario");
        }
        if (tiltak == null) {
            log.warn("Could not find tiltak with id = {} to delete", id);
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(TiltakResponse.buildFrom(tiltak));
        }
    }

    private TiltakResponse addRisikoscenarioer(TiltakResponse res) {
        res.setRisikoscenarioIds(service.getRisikoscenarioer(res.getId()));
        return res;
    }

    private TiltakResponse addResourceData(TiltakResponse res) {
        if (res.getAnsvarlig().getNavIdent() == null || res.getAnsvarlig().getNavIdent().isEmpty()) {
            return res;
        }

        var resourceData = teamcatResourceClient.getResource(res.getAnsvarlig().getNavIdent());
        if(resourceData.isPresent()) {
            res.setAnsvarlig(resourceData.get());
        } else {
            res.setAnsvarlig(Resource.builder()
                    .navIdent(res.getAnsvarlig().getNavIdent())
                    .givenName("Fant ikke person med NAV ident: " + res.getAnsvarlig().getNavIdent())
                    .familyName("Fant ikke person med NAV ident: " + res.getAnsvarlig().getNavIdent())
                    .fullName("Fant ikke person med NAV ident: " + res.getAnsvarlig().getNavIdent())
                    .email("Fant ikke person med NAV ident: " + res.getAnsvarlig().getNavIdent())
                    .resourceType(ResourceType.INTERNAL)
                    .build());
        }

        return res;
    }

    // FIXME: ITest
}
