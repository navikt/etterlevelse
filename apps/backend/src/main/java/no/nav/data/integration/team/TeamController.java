package no.nav.data.integration.team;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.varsel.domain.SlackChannel;
import no.nav.data.etterlevelse.varsel.domain.SlackUser;
import no.nav.data.integration.slack.SlackClient;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StartsWithComparator.startsWith;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;

@Slf4j
@RestController
@RequestMapping("/team")
@RequiredArgsConstructor
@Tag(name = "Team", description = "REST API for teams")
public class TeamController {

    private final TeamcatTeamClient teamsService;
    private final TeamcatResourceClient resourceService;
    private final SlackClient slackClient;

    // Teams

    @Operation(summary = "Get all teams")
    @ApiResponse(description = "Teams fetched")
    @GetMapping
    public RestResponsePage<TeamResponse> findAllTeams(@RequestParam(required = false) Boolean myTeams) {
        log.info("Received a request for all teams");
        List<Team> teams = teamsService.getAllTeams();
        if (Boolean.TRUE.equals(myTeams)) {
            var ident = SecurityUtils.getCurrentIdent();
            teams = filter(teams, t -> t.getMembers().stream().anyMatch(m -> m.getNavIdent().equals(ident)));
        }
        return new RestResponsePage<>(convert(teams, Team::toResponse));
    }

    @Operation(summary = "Get team")
    @ApiResponse(description = "Teams fetched")
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable String teamId) {
        log.info("Received request for Team with id {}", teamId);
        Optional<Team> team = teamsService.getTeam(teamId);
        if (team.isEmpty()) {
            throw new NotFoundException("Couldn't find team " + teamId);
        }
        return new ResponseEntity<>(team.get().toResponseWithMembers(), HttpStatus.OK);
    }

    @Operation(summary = "Search teams")
    @ApiResponse(description = "Teams fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<TeamResponse>> searchTeamByName(@PathVariable String name) {
        log.info("Received request for Team with the name like {}", name);
        validateLen(name);
        var teams = filter(teamsService.getAllTeams(), team -> containsIgnoreCase(team.getName(), name));
        teams.sort(comparing(Team::getName, startsWith(name)));
        log.info("Returned {} teams", teams.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, Team::toResponse)), HttpStatus.OK);
    }

    // Product Areas

    @Operation(summary = "Get all product areas")
    @ApiResponse(description = "Product areas fetched")
    @GetMapping("/productarea")
    public RestResponsePage<ProductAreaResponse> findAllProductAreas(@RequestParam(required = false) Boolean myProductAreas) {
        log.info("Received a request for all product areas");
        List<ProductArea> productAreas = teamsService.getAllProductAreas();
        if (Boolean.TRUE.equals(myProductAreas)) {
            var ident = SecurityUtils.getCurrentIdent();
            productAreas = filter(productAreas, pa -> pa.getMembers().stream().anyMatch(m -> m.getNavIdent().equals(ident)));
        }
        return new RestResponsePage<>(convert(productAreas, ProductArea::toResponse));
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
        return new ResponseEntity<>(pa.get().toResponseWithMembers(), HttpStatus.OK);
    }

    @Operation(summary = "Search product areas")
    @ApiResponse(description = "Product areas fetched")
    @GetMapping("/productarea/search/{name}")
    public ResponseEntity<RestResponsePage<ProductAreaResponse>> searchProductAreaByName(@PathVariable String name) {
        log.info("Received request for product areas with the name like {}", name);
        validateLen(name);
        var pas = filter(teamsService.getAllProductAreas(), pa -> containsIgnoreCase(pa.getName(), name));
        pas.sort(comparing(ProductArea::getName, startsWith(name)));
        log.info("Returned {} pas", pas.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(pas, ProductArea::toResponse)), HttpStatus.OK);
    }

    // Resources

    @Operation(summary = "Search resources")
    @ApiResponse(description = "Resources fetched")
    @GetMapping("/resource/search/{name}")
    public ResponseEntity<RestResponsePage<Resource>> searchResourceName(@PathVariable String name) {
        log.info("Resource search '{}'", name);
        validateLen(name);
        var resources = resourceService.search(name);
        log.info("Returned {} resources", resources.getPageSize());
        return new ResponseEntity<>(resources, HttpStatus.OK);
    }

    @Operation(summary = "Get Resource")
    @ApiResponse(description = "ok")
    @GetMapping("/resource/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        log.info("Resource get id={}", id);
        Optional<Resource> resource = resourceService.getResource(id);
        if (resource.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resource.get());
    }

    @Operation(summary = "Get Resource Photo")
    @ApiResponse(description = "ok")
    @GetMapping("/resource/{id}/photo")
    public ResponseEntity<byte[]> getResourcePhotoById(@PathVariable String id) {
        log.info("Resource Photo get id={}", id);
        Optional<byte[]> photo = resourceService.getResourcePhoto(id);
        if (photo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(photo.get());
    }

    // Slack

    @Operation(summary = "Search slack channels")
    @ApiResponse(description = "Channels fetched")
    @GetMapping("/slack/channel/search/{name}")
    public ResponseEntity<RestResponsePage<SlackChannel>> searchSlackChannel(@PathVariable String name) {
        log.info("Slack channel search '{}'", name);
        validateLen(name);
        var channels = slackClient.searchChannel(name);
        log.info("Returned {} channels", channels.size());
        return new ResponseEntity<>(new RestResponsePage<>(channels), HttpStatus.OK);
    }

    @Operation(summary = "Get slack channel")
    @ApiResponse(description = "Channel fetched")
    @GetMapping("/slack/channel/{id}")
    public ResponseEntity<SlackChannel> getSlackChannel(@PathVariable String id) {
        log.info("Slack channel '{}'", id);
        var channel = slackClient.getChannel(id);
        if (channel == null) {
            throw new NotFoundException("no channel for id " + id);
        }
        return new ResponseEntity<>(channel, HttpStatus.OK);
    }

    @Operation(summary = "Get slack user by email")
    @ApiResponse(description = "User fetched")
    @GetMapping("/slack/user/email/{email}")
    public ResponseEntity<SlackUser> getSlackUserByEmail(@PathVariable String email) {
        log.info("Slack user email '{}'", email);
        var user = slackClient.getUserByEmail(email);
        if (user == null) {
            throw new NotFoundException("no user for email " + email);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @Operation(summary = "Get slack user by id")
    @ApiResponse(description = "User fetched")
    @GetMapping("/slack/user/id/{id}")
    public ResponseEntity<SlackUser> getSlackUserById(@PathVariable String id) {
        log.info("Slack user id '{}'", id);
        var user = slackClient.getUserBySlackId(id);
        if (user == null) {
            throw new NotFoundException("no user for id " + id);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    private void validateLen(String name) {
        if (Stream.of(name.split(" ")).sorted().distinct().collect(Collectors.joining("")).length() < 3) {
            throw new ValidationException("Search must be at least 3 characters");
        }
    }

    static class ResourcePage extends RestResponsePage<Resource> {

    }

    static class TeamPage extends RestResponsePage<TeamResponse> {

    }

    static class ProductAreaPage extends RestResponsePage<ProductAreaResponse> {

    }
}
