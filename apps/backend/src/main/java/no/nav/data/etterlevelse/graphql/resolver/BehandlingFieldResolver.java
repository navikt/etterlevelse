package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.graphql.DataLoaderReg;
import no.nav.data.integration.team.dto.TeamResponse;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class BehandlingFieldResolver implements GraphQLResolver<Behandling> {

    public CompletableFuture<List<TeamResponse>> behandling(Behandling behandling, DataFetchingEnvironment env) {
        DataLoader<String, TeamResponse> loader = env.getDataLoader(DataLoaderReg.TEAM);
        return loader.loadMany(behandling.getTeams());
    }
}
