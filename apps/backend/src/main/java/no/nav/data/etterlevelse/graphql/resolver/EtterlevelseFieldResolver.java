package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.graphql.DataLoaderReg;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class EtterlevelseFieldResolver implements GraphQLResolver<EtterlevelseResponse> {
    public CompletableFuture<Behandling> behandling(EtterlevelseResponse etterlevelse, DataFetchingEnvironment env) {
        DataLoader<String, Behandling> loader = env.getDataLoader(DataLoaderReg.BEHANDLING);
        if(etterlevelse.getBehandling() != null || !etterlevelse.getBehandlingId().equals("")) {
            return loader.load(etterlevelse.getBehandlingId());
        }else {
            return null;
        }
    }
}
