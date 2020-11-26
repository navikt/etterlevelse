package no.nav.data.integration.team;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.integration.team.domain.ProductArea;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.ProductAreaResponse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StartsWithComparator.startsWith;
import static no.nav.data.common.utils.StreamUtils.convert;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;

@Slf4j
@RestController
@RequestMapping("/team")
@Tag(name = "Team", description = "REST API for teams")
public class TeamController {

    private final TeamcatTeamClient teamsService;
    private final TeamcatResourceClient resourceService;

    public TeamController(TeamcatTeamClient teamsService, TeamcatResourceClient resourceService) {
        this.teamsService = teamsService;
        this.resourceService = resourceService;
    }

    // Teams

    @Operation(summary = "Get all teams")
    @ApiResponse(description = "Teams fetched")
    @GetMapping
    public RestResponsePage<TeamResponse> findAllTeams() {
        log.info("Received a request for all teams");
        return new RestResponsePage<>(convert(teamsService.getAllTeams(), Team::convertToResponse));
    }

    @Operation(summary = "Get team")
    @ApiResponse(description = "Teams fetched")
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamResponse> getTeamByName(@PathVariable String teamId) {
        log.info("Received request for Team with id {}", teamId);
        Optional<Team> team = teamsService.getTeam(teamId);
        if (team.isEmpty()) {
            throw new NotFoundException("Couldn't find team " + teamId);
        }
        return new ResponseEntity<>(team.get().convertToResponseWithMembers(), HttpStatus.OK);
    }

    @Operation(summary = "Search teams")
    @ApiResponse(description = "Teams fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<TeamResponse>> searchTeamByName(@PathVariable String name) {
        log.info("Received request for Team with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search teams must be at least 3 characters");
        }
        var teams = StreamUtils.filter(teamsService.getAllTeams(), team -> containsIgnoreCase(team.getName(), name));
        teams.sort(comparing(Team::getName, startsWith(name)));
        log.info("Returned {} teams", teams.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, Team::convertToResponse)), HttpStatus.OK);
    }

    // Product Areas

    @Operation(summary = "Get all product areas")
    @ApiResponse(description = "Product areas fetched")
    @GetMapping("/productarea")
    public RestResponsePage<ProductAreaResponse> findAllProductAreas() {
        log.info("Received a request for all product areas");
        return new RestResponsePage<>(convert(teamsService.getAllProductAreas(), ProductArea::convertToResponse));
    }

    @Operation(summary = "Get product area")
    @ApiResponse(description = "Product area fetched")
    @GetMapping("/productarea/{paId}")
    public ResponseEntity<ProductAreaResponse> getProductAreaById(@PathVariable String paId) {
        log.info("Received request for Product area with id {}", paId);
        var pa = teamsService.getProductArea(paId);
        if (pa.isEmpty()) {
            throw new NotFoundException("Couldn't find product area " + paId);
        }
        return new ResponseEntity<>(pa.get().convertToResponseWithMembers(), HttpStatus.OK);
    }

    @Operation(summary = "Search product areas")
    @ApiResponse(description = "Product areas fetched")
    @GetMapping("/productarea/search/{name}")
    public ResponseEntity<RestResponsePage<ProductAreaResponse>> searchProductAreaByName(@PathVariable String name) {
        log.info("Received request for product areas with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search product area must be at least 3 characters");
        }
        var pas = StreamUtils.filter(teamsService.getAllProductAreas(), pa -> containsIgnoreCase(pa.getName(), name));
        pas.sort(comparing(ProductArea::getName, startsWith(name)));
        log.info("Returned {} pas", pas.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(pas, ProductArea::convertToResponse)), HttpStatus.OK);
    }

    // Resources

    @Operation(summary = "Search resources")
    @ApiResponse(description = "Resources fetched")
    @GetMapping("/resource/search/{name}")
    public ResponseEntity<RestResponsePage<Resource>> searchResourceName(@PathVariable String name) {
        log.info("Resource search '{}'", name);
        if (Stream.of(name.split(" ")).sorted().distinct().collect(Collectors.joining("")).length() < 3) {
            throw new ValidationException("Search resource must be at least 3 characters");
        }
        var resources = resourceService.search(name);
        log.info("Returned {} resources", resources.getPageSize());
        return new ResponseEntity<>(resources, HttpStatus.OK);
    }

    @Operation(summary = "Get Resource")
    @ApiResponse(description = "ok")
    @GetMapping("/resource/{id}")
    public ResponseEntity<Resource> getById(@PathVariable String id) {
        log.info("Resource get id={}", id);
        Optional<Resource> resource = resourceService.getResource(id);
        if (resource.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resource.get());
    }

    static class ResourcePage extends RestResponsePage<Resource> {

    }

    static class TeamPage extends RestResponsePage<TeamResponse> {

    }

    static class ProductAreaPage extends RestResponsePage<ProductAreaResponse> {

    }
}
