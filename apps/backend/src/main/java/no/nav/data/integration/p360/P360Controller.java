package no.nav.data.integration.p360;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.behandling.dto.DataBehandler;
import no.nav.data.integration.p360.dto.P360Case;
import no.nav.data.integration.p360.dto.P360GetRequest;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Slf4j
@RestController
@Tag(name = "Public 360", description = "Public 360 for arkivering")
@RequestMapping("/p360")
@RequiredArgsConstructor
public class P360Controller {

    private final P360Service p360Service;

    @Operation(summary = "Get Cases")
    @ApiResponses(value = {@ApiResponse(description = "Behandlinger fetched")})
    @PostMapping("getCases")
    public ResponseEntity<RestResponsePage<P360Case>> findCases(@RequestBody P360GetRequest request) {
        log.info("Finding all cases by title or case number");
        List<P360Case> cases;
        if (request.getCaseNumber() != null) {
            cases = p360Service.getCasesByCaseNumber(request.getCaseNumber());
        } else {
            cases = p360Service.getCasesByTitle(request.getTitle());
        }
        return ResponseEntity.ok(new RestResponsePage<>(cases));
    }


}
