package no.nav.data.etterlevelse.graphql;

import lombok.RequiredArgsConstructor;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderFactory;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.function.Function;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.toMap;

@Component
@RequiredArgsConstructor
public class DataLoaderReg {

    public static final String ETTERLEVELSE_FOR_ETTERLEVELSEDOKUMENTASJON_LOADER = "ETTERLEVELSE_FOR_ETTERLEVELSEDOKUMENTASJON_LOADER";

    public static final String ETTERLEVELSEDOKUMENTASJON = "ETTERLEVELSEDOKUMENTASJON_LOADER";

    public static final String BEHANDLING = "BEHANDLING_LOADER";
    public static final String RESOURCES = "RESOURCES_LOADER";
    public static final String TEAM = "TEAM_LOADER";

    private final Executor graphQLExecutor;
    private final BehandlingService behandlingService;
    private final EtterlevelseService etterlevelseService;
    private final TeamcatResourceClient resourceClient;
    private final TeamcatTeamClient teamClient;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    public DataLoaderRegistry create() {
        return new DataLoaderRegistry()
                .register(ETTERLEVELSE_FOR_ETTERLEVELSEDOKUMENTASJON_LOADER, etterlevelseForEtterlevelseDokumentasjonLoader())
                .register(ETTERLEVELSEDOKUMENTASJON, etterlevelseDokumentasjonLoader())
                .register(BEHANDLING, behandlingLoader())
                .register(RESOURCES, resourcesLoader())
                .register(TEAM, teamLoader());
    }

    private DataLoader<String, Behandling> behandlingLoader() {
        return loader(behandlingService::findAllByIdMapped);
    }

    private DataLoader<String, List<Etterlevelse>> etterlevelseForEtterlevelseDokumentasjonLoader(){
        return loader(etterlevelseService::getByEtterlevelseDokumentasjoner);
    }

    private DataLoader<UUID, EtterlevelseDokumentasjonResponse> etterlevelseDokumentasjonLoader(){
        return loader(this::getEtterlevelseDokumentasjoner);
    }

    private DataLoader<String, Resource> resourcesLoader() {
        return loader(resourceClient::getResources);
    }

    private DataLoader<String, TeamResponse> teamLoader() {
        return loader(this::getTeams);
    }

    private <ID, R> DataLoader<ID, R> loader(Function<Set<ID>, Map<ID, R>> supplier) {
        return DataLoaderFactory.newMappedDataLoader(
                (Set<ID> set) -> CompletableFuture.supplyAsync(() -> supplier.apply(set), graphQLExecutor)
        );
    }

    private Map<UUID, EtterlevelseDokumentasjonResponse> getEtterlevelseDokumentasjoner(Collection<UUID> ids) {
        List<EtterlevelseDokumentasjonResponse> etterlevelseDokumentasjonResponseList = new ArrayList<>();
        ids.forEach(id -> {
            etterlevelseDokumentasjonResponseList.add(etterlevelseDokumentasjonService.get(id).toResponse());
        });
        Map<UUID, EtterlevelseDokumentasjonResponse> map = toMap(etterlevelseDokumentasjonResponseList, EtterlevelseDokumentasjonResponse::getId);
        return map;
    }

    private Map<String, TeamResponse> getTeams(Collection<String> ids) {
        var teams = filter(teamClient.getAllTeams(), t -> ids.contains(t.getId()));
        List<TeamResponse> teamResponses = convert(teams, Team::toResponseWithMembers);

        teamResponses.forEach(t -> {
            if(t.getProductAreaId() != null && !t.getProductAreaId().isEmpty()) {
               var po = teamClient.getProductArea(t.getProductAreaId());
               po.ifPresent((productArea) -> t.setProductAreaName(productArea.getName()));
            }
        });

        Map<String, TeamResponse> map = toMap(teamResponses, TeamResponse::getId);
        var missing = new ArrayList<>(ids);
        missing.removeAll(map.keySet());
        missing.forEach(id -> map.put(id, new TeamResponse(id)));
        return map;
    }

}
