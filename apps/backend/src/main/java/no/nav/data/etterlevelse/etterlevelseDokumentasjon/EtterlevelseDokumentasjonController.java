package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonWithRelationRequest;
import no.nav.data.integration.team.dto.MemberResponse;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@Tag(name = "EtterlevelseDokumentasjon", description = "Etterlevelse Dokumentasjon")
@RequestMapping("/etterlevelsedokumentasjon")
public class EtterlevelseDokumentasjonController {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    @Operation(summary = "Get All Etterlevelse Dokumentasjon")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<EtterlevelseDokumentasjonResponse>> getAll(PageParameters pageParameters) {
        log.info("get all etterlevelse dokumentasjon");
        Page<EtterlevelseDokumentasjon> etterlevelseDokumentasjonPage = etterlevelseDokumentasjonService.getAll(pageParameters);
        return ResponseEntity.ok(new RestResponsePage<>(etterlevelseDokumentasjonPage).convert(EtterlevelseDokumentasjonResponse::buildFrom));
    }

    @Operation(summary = "Get One Etterlevelse Dokumentasjon")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<EtterlevelseDokumentasjonResponse> getById(@PathVariable UUID id) {
        log.info("Get Etterlevelse Dokumentasjon By Id Id={}", id);
        var response = EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjonService.get(id));
        etterlevelseDokumentasjonService.addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(response);
        
        boolean resourceIsEmpty = response.getResources() == null || response.getResources().isEmpty();
        boolean teamIsEmpty = response.getTeams() == null || response.getTeams().isEmpty();
        boolean risikoeiereIsEmpty = response.getRisikoeiere() == null || response.getRisikoeiere().isEmpty();

        if (resourceIsEmpty && teamIsEmpty && risikoeiereIsEmpty) {
            response.setHasCurrentUserAccess(true);
        } else {
            List<String> memeberList = new ArrayList<>();
            var currentUser = SecurityUtils.getCurrentIdent();
            if (!resourceIsEmpty) {
                memeberList.addAll(response.getResources());
            }
            if (!risikoeiereIsEmpty) {
                memeberList.addAll(response.getRisikoeiere());
            }
            if (!teamIsEmpty) {
                response.getTeamsData().forEach((team) -> {
                    if (team.getMembers() != null && !team.getMembers().isEmpty()) {
                        memeberList.addAll(team.getMembers().stream().map(MemberResponse::getNavIdent).toList());
                    }
                });
            }
            response.setHasCurrentUserAccess(memeberList.contains(currentUser));
        }

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get All Etterlevelse Dokumentasjon by relevans")
    @ApiResponse(description = "ok")
    @GetMapping("/relevans")
    public ResponseEntity<List<EtterlevelseDokumentasjonResponse>> getAllEtterlevelseDokumentasjonByRelevans(@RequestParam List<String> kravRelevans) {
        log.info("get all etterlevelse dokumentasjon by relevans");
        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjoner = etterlevelseDokumentasjonService.findByKravRelevans(kravRelevans);
        return ResponseEntity.ok(etterlevelseDokumentasjoner.stream().map(EtterlevelseDokumentasjonResponse::buildFrom).toList());
    }

    @Operation(summary = "Search Etterlevelse Dokumentasjon by BehandlingId")
    @ApiResponse(description = "ok")
    @GetMapping("/search/behandling/{id}")
    public ResponseEntity<RestResponsePage<EtterlevelseDokumentasjonResponse>> searchByBehandling(@PathVariable String id) {
        log.info("Search Etterlevelse Dokumentsjon by behandlingId with id={}", id);

        var etterleveseDokumentasjon = etterlevelseDokumentasjonService.getByBehandlingId(List.of(id));

        return ResponseEntity.ok(new RestResponsePage<>(etterleveseDokumentasjon).convert(EtterlevelseDokumentasjonResponse::buildFrom));
    }

    @Operation(summary = "Search Etterlevelse Dokumentasjon by VirkemiddelId")
    @ApiResponse(description = "ok")
    @GetMapping("/search/virkemiddel/{id}")
    public ResponseEntity<RestResponsePage<EtterlevelseDokumentasjonResponse>> searchByVirkemiddel(@PathVariable String id) {
        log.info("Search Etterlevelse Dokumentsjon by virkemiddelId with id={}", id);

        var etterleveseDokumentasjon = etterlevelseDokumentasjonService.getByVirkemiddelId(List.of(id));

        return ResponseEntity.ok(new RestResponsePage<>(etterleveseDokumentasjon).convert(EtterlevelseDokumentasjonResponse::buildFrom));
    }

    @Operation(summary = "Search Etterlevelse Dokumentasjon by team id")
    @ApiResponse(description = "ok")
    @GetMapping("/search/team/{id}")
    public ResponseEntity<RestResponsePage<EtterlevelseDokumentasjonResponse>> searchByTeam(@PathVariable String id) {
        log.info("Search Etterlevelse Dokumentsjon by teamId with id={}", id);

        var etterleveseDokumentasjon = etterlevelseDokumentasjonService.getEtterlevelseDokumentasjonerByTeam(id);

        return ResponseEntity.ok(new RestResponsePage<>(etterleveseDokumentasjon).convert(EtterlevelseDokumentasjonResponse::buildFrom));
    }

    @Operation(summary = "Search Etterlevelse Dokumentasjon")
    @ApiResponse(description = "ok")
    @GetMapping("/search/{searchParam}")
    public ResponseEntity<RestResponsePage<EtterlevelseDokumentasjonResponse>> searchEtterlevelseDokumentasjon(@PathVariable String searchParam) {
        log.info("Search Etterlevelse Dokumentsjon by={}", searchParam);
        if (searchParam.length() < 3) {
            throw new ValidationException("Search Etterlevelse Dokumentasjon must be at least 3 characters");
        }
        List<EtterlevelseDokumentasjon> etterleveseDokumentasjon = etterlevelseDokumentasjonService.searchEtterlevelseDokumentasjon(searchParam);
        return ResponseEntity.ok(new RestResponsePage<>(etterleveseDokumentasjon).convert(EtterlevelseDokumentasjonResponse::buildFrom));
    }

    @Operation(summary = "Create Etterlevelse Dokumentasjon")
    @ApiResponse(responseCode = "201", description = "Etterlevelse Dokumentasjon created")
    @PostMapping
    public ResponseEntity<EtterlevelseDokumentasjonResponse> createEtterlevelseDokumentasjon(@RequestBody EtterlevelseDokumentasjonRequest request) {
        log.info("Create Etterlevelse Dokumentasjon");
        var etterlevelseDokumentasjon = etterlevelseDokumentasjonService.save(request);
        return new ResponseEntity<>(EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjon), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Etterlevelse Dokumentasjon")
    @ApiResponse(description = "Etterlevelse Dokumentasjon updated")
    @PutMapping("/{id}")
    public ResponseEntity<EtterlevelseDokumentasjonResponse> updateEtterlevelseDokumentasjon(@PathVariable UUID id, @Valid @RequestBody EtterlevelseDokumentasjonRequest request) {
        log.debug("Update Etterlevelse Dokumentasjon id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var response = EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjonService.save(request));
        etterlevelseDokumentasjonService.addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(response);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update Krav Priority for Etterlevelse Dokumentasjon")
    @ApiResponse(description = "Krav Priority for Etterlevelse Dokumentasjon updated")
    @PutMapping("/kravpriority/{id}")
    public ResponseEntity<EtterlevelseDokumentasjonResponse> updateKravPriorityForEtterlevelseDokumentasjon(@PathVariable UUID id, @Valid @RequestBody EtterlevelseDokumentasjonRequest request) {
        log.debug("Update Etterlevelse Dokumentasjon id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var response = EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjonService.updateKravPriority(request));
        etterlevelseDokumentasjonService.addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(response);

        return ResponseEntity.ok(response);
    }


    @Operation(summary = "Create Etterlevelse Dokumentasjon with relation")
    @ApiResponse(description = "Created Etterlevelse Dokumentasjon with relation")
    @PostMapping("/relation/{fromDocumentId}")
    public ResponseEntity<EtterlevelseDokumentasjonResponse> createEtterlevelseDokumentasjonWithRelation(@PathVariable UUID fromDocumentId, @Valid @RequestBody EtterlevelseDokumentasjonWithRelationRequest request) {
        log.debug("Create Etterlevelse Dokumentasjon with relation to id={}", fromDocumentId);
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(fromDocumentId);
        if(!etterlevelseDokumentasjon.isTilgjengeligForGjenbruk()) {
            throw new ValidationException(String.format("Cannot create relation with etterlevelse dokumentasjon with id %s, Etterlevelse dokumentasjo is not available for relations", fromDocumentId.toString()));
        }

        var newEtterlevelseDokumentasjon = etterlevelseDokumentasjonService.saveAndCreateRelationWithEtterlevelseCopy(fromDocumentId ,request);
        var response = EtterlevelseDokumentasjonResponse.buildFrom(newEtterlevelseDokumentasjon);
        etterlevelseDokumentasjonService.addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(response);
        return ResponseEntity.ok(response);
    }

    @ApiResponse(description = "Etterlevelse deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<EtterlevelseDokumentasjonResponse> deleteEtterlevelseById(@PathVariable UUID id) {
        log.info("Delete Etterlevelse Dokumentasjon By Id={}", id);
        var etterlevelseDokumentasjon = etterlevelseDokumentasjonService.deleteEtterlevelseDokumentasjonAndAllChildren(id);
        return ResponseEntity.ok(EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjon));
    }

    static class EtterlevelseDokumentasjonPage extends RestResponsePage<EtterlevelseDokumentasjonResponse> {
    }
}
