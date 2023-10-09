package no.nav.data.integration.behandling;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Slf4j
@RestController
@Tag(name = "Behandling", description = "Behandling from Behandlingskatalogen")
@RequestMapping("/behandling")
@RequiredArgsConstructor
public class BehandlingController {

    private final BehandlingService service;
    private final TeamcatTeamClient teamClient;

    @Operation(summary = "Get Behandlinger")
    @ApiResponses(value = {@ApiResponse(description = "Behandlinger fetched")})
    @GetMapping
    public ResponseEntity<RestResponsePage<Behandling>> findBehandlinger(
            @RequestParam(required = false) Boolean myBehandlinger,
            @RequestParam(required = false) String teamId
    ) {
        log.info("Finding all behandlinger by teamId");
        List<Behandling> behandlinger;
        if (teamId == null || Boolean.TRUE.equals(myBehandlinger)) {
            behandlinger = teamClient.getMyTeams().stream()
                    .map(Team::getId)
                    .map(service::getBehandlingerForTeam)
                    .flatMap(Collection::stream)
                    .collect(toList());
            behandlinger = StreamUtils.distinctByKey(behandlinger, Behandling::getId);
        } else {
            behandlinger = service.getBehandlingerForTeam(teamId);
        }
        return ResponseEntity.ok(new RestResponsePage<>(behandlinger));
    }

    @Operation(summary = "Get Behandling")
    @ApiResponses(value = {@ApiResponse(description = "Behandling fetched")})
    @GetMapping("/{id}")
    public ResponseEntity<Behandling> getBehandling(@PathVariable String id) {
        log.info("Get behandling by id={}", id);
        Behandling behandlinger = service.getBehandling(id);
        if (behandlinger == null) {
            throw new NotFoundException("behandling %s not found".formatted(id));
        }
        return ResponseEntity.ok(behandlinger);
    }

    @Operation(summary = "Search Behandlinger")
    @ApiResponses(value = {@ApiResponse(description = "Behandlinger fetched")})
    @GetMapping("/search/{search}")
    public ResponseEntity<RestResponsePage<Behandling>> searchBehandlinger(@PathVariable String search) {
        if (search == null || search.replace(" ", "").length() < 3) {
            return ResponseEntity.badRequest().build();
        }
        log.info("Search behandling by value={}", search);
        List<Behandling> behandlingList = service.findBehandlinger(search);
        return ResponseEntity.ok(new RestResponsePage<>(behandlingList));
    }

    public static class BehandlingPage extends RestResponsePage<Behandling> {

    }
}
