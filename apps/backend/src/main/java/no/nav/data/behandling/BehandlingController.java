package no.nav.data.behandling;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.behandling.dto.Behandling;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.integration.behandling.BkatClient;
import no.nav.data.integration.behandling.dto.BkatProcess;
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
@Tag(description = "Behandlingskatalog", name = "Integration")
@RequestMapping("/behandling")
@RequiredArgsConstructor
public class BehandlingController {

    private final BkatClient client;
    private final TeamcatTeamClient teamClient;

    @Operation(summary = "Get Behandlinger")
    @ApiResponses(value = {@ApiResponse(description = "Behandlinger fetched")})
    @GetMapping
    public ResponseEntity<RestResponsePage<Behandling>> findBehandlinger(
            @RequestParam(required = false) Boolean myBehandlinger,
            @RequestParam(required = false) String teamId
    ) {
        List<BkatProcess> processes;
        if (teamId == null || Boolean.TRUE.equals(myBehandlinger)) {
            String currentIdent = SecurityUtils.getCurrentIdent();
            processes = teamClient.getAllTeams().stream()
                    .filter(team -> team.getMembers().stream().anyMatch(m -> m.getNavIdent().equals(currentIdent)))
                    .map(Team::getId)
                    .map(client::getProcessesForTeam)
                    .flatMap(Collection::stream)
                    .collect(toList());
        } else {
            processes = client.getProcessesForTeam(teamId);
        }
        return ResponseEntity.ok(new RestResponsePage<>(processes).convert(BkatProcess::convertToBehandling));
    }

    @Operation(summary = "Get Behandling")
    @ApiResponses(value = {@ApiResponse(description = "Behandling fetched")})
    @GetMapping("/{id}")
    public ResponseEntity<Behandling> getBehandling(@PathVariable String id) {
        BkatProcess process = client.getProcess(id);
        return ResponseEntity.ok(process.convertToBehandling());
    }

    @Operation(summary = "Search Behandlinger")
    @ApiResponses(value = {@ApiResponse(description = "Behandlinger fetched")})
    @GetMapping("/search/{search}")
    public ResponseEntity<RestResponsePage<Behandling>> searchBehandlinger(@PathVariable String search) {
        if (search == null || search.replace(" ", "").length() < 3) {
            return ResponseEntity.badRequest().build();

        }
        List<BkatProcess> processes = client.findProcesses(search);
        return ResponseEntity.ok(new RestResponsePage<>(processes).convert(BkatProcess::convertToBehandling));
    }

    static class BehandlingPage extends RestResponsePage<Behandling> {

    }
}
