package no.nav.data.integration.team.teamcat;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.integration.team.domain.ProductArea;
import no.nav.data.integration.team.domain.Team;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.safeStream;

@Slf4j
@Service
public class TeamcatTeamClient {

    private final RestTemplate restTemplate;
    private final TeamcatProperties properties;

    private final LoadingCache<String, Map<String, Team>> allTeamsCache;
    private final LoadingCache<String, Map<String, ProductArea>> allPaCache;

    public TeamcatTeamClient(RestTemplate restTemplate,
            TeamcatProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;

        this.allTeamsCache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(1).build(k -> getTeamsResponse());
        MetricUtils.register("teamsCache", allTeamsCache);

        this.allPaCache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(1).build(k -> getProductAreasResponse());
        MetricUtils.register("productAreaCache", allPaCache);
    }

    public List<Team> getAllTeams() {
        ArrayList<Team> teams = new ArrayList<>(getTeams().values());
        teams.sort(Comparator.comparing(Team::getName));
        return teams;
    }

    public Optional<Team> getTeam(String teamId) {
        return Optional.ofNullable(getTeams().get(teamId));
    }

    public List<Team> getMyTeams() {
        String currentIdent = SecurityUtils.getCurrentIdent();
        var teams = getAllTeams().stream()
                .filter(team -> team.getMembers().stream().anyMatch(m -> m.getNavIdent().equals(currentIdent)))
                .toList();

        if (teams.isEmpty()) {
            var newTeams = new ArrayList<Team>();

            var productAreas = getAllProductAreas().stream()
                    .filter(po -> po.getMembers().stream().anyMatch(m -> m.getNavIdent().equals(currentIdent)))
                    .toList();

            for (ProductArea po: productAreas) {
                var poTeams = getAllTeams().stream()
                        .filter(team -> team.getProductAreaId() != null && team.getProductAreaId().equals(po.getId()))
                        .toList();
                newTeams.addAll(poTeams);
            }

            teams = new ArrayList<>(new LinkedHashSet<>(newTeams));
        }

        return teams;
    }

    public List<ProductArea> getAllProductAreas() {
        var pas = new ArrayList<>(getProductAreas().values());
        pas.sort(Comparator.comparing(ProductArea::getName));
        return pas;
    }

    public Optional<ProductArea> getProductArea(String productAreaId) {
        return Optional.ofNullable(getProductAreas().get(productAreaId));
    }

    public List<Team> getTeamsForProductArea(String productAreaId) {
        return filter(getAllTeams(), t -> productAreaId.equals(t.getProductAreaId()));
    }

    private Map<String, ProductArea> getProductAreasResponse() {
        var response = restTemplate.getForEntity(properties.getProductAreasUrl(), ProductAreaPage.class);
        List<TeamKatProductArea> teams = response.hasBody() ? requireNonNull(response.getBody()).getContent() : List.of();
        return safeStream(teams)
                .map(TeamKatProductArea::convertToProductArea)
                .collect(Collectors.toMap(ProductArea::getId, Function.identity()));
    }

    private Map<String, ProductArea> getProductAreas() {
        return allPaCache.get("singleton");
    }

    public boolean teamExists(String teamId) {
        return getTeams().containsKey(teamId);
    }

    private Map<String, Team> getTeams() {
        return allTeamsCache.get("singleton");
    }

    private Map<String, Team> getTeamsResponse() {
        List<TeamKatTeam> teams = List.of();
        try {
            var response = restTemplate.getForEntity(properties.getTeamsUrl(), TeamPage.class);
            teams = response.hasBody() ? requireNonNull(response.getBody()).getContent() : List.of();
        } catch (RestClientException e) {
            log.error("Unable to connect to teamkatalog, error: " + e);
        }

        return safeStream(teams)
                .map(TeamKatTeam::convertToTeam)
                .collect(Collectors.toMap(Team::getId, Function.identity()));
    }

    static class TeamPage extends RestResponsePage<TeamKatTeam> {

    }

    static class ProductAreaPage extends RestResponsePage<TeamKatProductArea> {

    }

}
