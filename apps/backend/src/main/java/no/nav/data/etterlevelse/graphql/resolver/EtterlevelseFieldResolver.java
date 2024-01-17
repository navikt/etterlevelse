package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.graphql.DataLoaderReg;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
public class EtterlevelseFieldResolver implements GraphQLResolver<EtterlevelseResponse> {

    public CompletableFuture<EtterlevelseDokumentasjonResponse> etterlevelseDokumentasjon(EtterlevelseResponse etterlevelse, DataFetchingEnvironment env) {
        DataLoader<UUID, EtterlevelseDokumentasjonResponse> loader = env.getDataLoader(DataLoaderReg.ETTERLEVELSEDOKUMENTASJON);
        if(etterlevelse.getEtterlevelseDokumentasjonId() != null) {
            return loader.load( UUID.fromString(etterlevelse.getEtterlevelseDokumentasjonId()));
        } else {
            CompletableFuture<EtterlevelseDokumentasjonResponse> legacy_data = new CompletableFuture<>();
            legacy_data.complete(EtterlevelseDokumentasjonResponse.builder()
                    .build());
            return legacy_data;
        }
    }
}
