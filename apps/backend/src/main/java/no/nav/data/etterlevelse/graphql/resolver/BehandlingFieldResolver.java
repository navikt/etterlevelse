package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.graphql.DataLoaderReg;
import no.nav.data.etterlevelse.graphql.support.LoaderUtils;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.integration.team.dto.TeamResponse;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.etterlevelse.graphql.DataLoaderReg.ETTERLEVELSER_FOR_BEHANDLING_LOADER;

@Slf4j
@Component
@RequiredArgsConstructor
public class BehandlingFieldResolver implements GraphQLResolver<Behandling> {

    public CompletableFuture<List<TeamResponse>> teamsData(Behandling behandling, DataFetchingEnvironment env) {
        DataLoader<String, TeamResponse> loader = env.getDataLoader(DataLoaderReg.TEAM);
        return loader.loadMany(behandling.getTeams());
    }

    public CompletableFuture<List<EtterlevelseResponse>> etterlevelser(Behandling behandling, DataFetchingEnvironment env) {
        return LoaderUtils.get(env, ETTERLEVELSER_FOR_BEHANDLING_LOADER, behandling.getId(), (List<Etterlevelse> e) -> convert(e, Etterlevelse::toResponse));
    }

    public CompletableFuture<LocalDateTime> sistEndretEtterlevelse(Behandling behandling, DataFetchingEnvironment env) {
        return LoaderUtils.get(env, ETTERLEVELSER_FOR_BEHANDLING_LOADER, behandling.getId(), this::sistEndret);
    }

    private LocalDateTime sistEndret(List<Etterlevelse> etterlevelser) {
        return etterlevelser.stream()
                .map(e -> e.getChangeStamp().getLastModifiedDate())
                .max(Comparator.comparing(Function.identity()))
                .orElse(null);
    }

}
