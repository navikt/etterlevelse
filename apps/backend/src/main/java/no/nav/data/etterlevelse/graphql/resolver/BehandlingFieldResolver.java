package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.behandling.dto.BehandlingStats;
import no.nav.data.etterlevelse.behandling.dto.BehandlingStats.LovStats;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class BehandlingFieldResolver implements GraphQLResolver<Behandling> {

    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;

    private final TeamcatTeamClient teamClient;

    public List<TeamResponse> teamsData(Behandling behandling, DataFetchingEnvironment env) {
        List<String> teams = behandling.getTeams();
        return getTeamsData(teams);
    }

    private List<TeamResponse> getTeamsData(Collection<String> ids) {
        var teams = filter(teamClient.getAllTeams(), t -> ids.contains(t.getId()));
        Map<String, TeamResponse> map = toMap(convert(teams, Team::toResponseWithMembers), TeamResponse::getId);
        var missing = new ArrayList<>(ids);
        missing.removeAll(map.keySet());
        missing.forEach(id -> map.put(id, new TeamResponse(id)));
        return new ArrayList<>(map.values());
    }

    public BehandlingStats stats(Behandling behandling) {
        var relevans = behandling.getIrrelevansFor();

        // Temporarily disabled
        /*
       if (relevans.isEmpty()) {
            return BehandlingStats.empty();
        }
        */

        var etterlevelser = etterlevelseService.getByBehandling(behandling.getId());
        var krav = convert(kravService.findForBehandling(behandling.getId()), Krav::toResponse);
        var irrelevantKrav = convert(kravService.findForBehandlingIrrelevans(behandling.getId()), Krav::toResponse);

        var fylt = filter(krav, k -> etterlevelser.stream().anyMatch(e -> e.isEtterleves() && e.kravId().equals(k.kravId())));
        var ikkeFylt = filter(krav, k -> !fylt.contains(k));

        var irrelevant = filter(irrelevantKrav, i -> !fylt.contains(i) && !ikkeFylt.contains(i));


        return BehandlingStats.builder()
                .fyltKrav(fylt)
                .ikkeFyltKrav(ikkeFylt)
                .irrelevantKrav(irrelevant)
                .lovStats(convert(CodelistService.getCodelist(ListName.LOV), c -> LovStats.builder()
                        .lovCode(c.toResponse())
                        .fyltKrav(filter(fylt, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .ikkeFyltKrav(filter(ikkeFylt, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .irrelevantKrav(filter(irrelevant,k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .build()))
                .build();
    }

    public List<EtterlevelseResponse> etterlevelser(Behandling behandling, DataFetchingEnvironment env) {
        return etterlevelseService.getByBehandling(behandling.getId()).stream().map(Etterlevelse::toResponse).collect(Collectors.toList());
    }

    public LocalDateTime sistEndretEtterlevelse(Behandling behandling, DataFetchingEnvironment env) {
        return sistEndret(etterlevelseService.getByBehandling(behandling.getId()));
    }

    private LocalDateTime sistEndret(List<Etterlevelse> etterlevelser) {
        return etterlevelser.stream()
                .map(e -> e.getChangeStamp().getLastModifiedDate())
                .max(Comparator.comparing(Function.identity()))
                .orElse(null);
    }

}
