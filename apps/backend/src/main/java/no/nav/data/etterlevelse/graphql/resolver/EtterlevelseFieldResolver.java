package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.common.domain.ExternalCode;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.graphql.DataLoaderReg;
import no.nav.data.integration.team.dto.TeamResponse;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class EtterlevelseFieldResolver implements GraphQLResolver<EtterlevelseResponse> {
    public CompletableFuture<Behandling> behandling(EtterlevelseResponse etterlevelse, DataFetchingEnvironment env) {
        DataLoader<String, Behandling> loader = env.getDataLoader(DataLoaderReg.BEHANDLING);
        if(etterlevelse.getBehandling() != null && !etterlevelse.getBehandlingId().equals("")) {
            return loader.load(etterlevelse.getBehandlingId());
        }else {
            CompletableFuture<Behandling> legacy_data = new CompletableFuture<>();
            legacy_data.complete(Behandling.builder()
                    .id("LEGACY_DATA")
                    .nummer(0)
                    .navn("LEGACY_DATA")
                    .overordnetFormaal(ExternalCode.builder().shortName("LEGACY_DATA").build())
                    .system(ExternalCode.builder().code("LEGACY_DATA").shortName("LEGACY_DATA").build())
                    .avdeling(ExternalCode.builder().code("LEGACY_DATA").shortName("LEGACY_DATA").build())
                    .teamsData(List.of(TeamResponse.builder().id("LEGACY_DATA").name("LEGACY_DATA").build()))
                    .build());
            return legacy_data;
        }
    }
}
