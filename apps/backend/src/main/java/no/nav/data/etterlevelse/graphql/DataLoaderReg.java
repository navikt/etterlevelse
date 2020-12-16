package no.nav.data.etterlevelse.graphql;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoaderReg {

    public static final String BEHANDLING = "BEHANDLING_LOADER";

    private final Executor graphQLExectuor;
    private final BehandlingService behandlingService;

    public DataLoaderRegistry create() {
        return new DataLoaderRegistry()
                .register(BEHANDLING, behandlingLoader());
    }

    private DataLoader<String, Behandling> behandlingLoader() {
        return DataLoader.newMappedDataLoader(
                (Set<String> set) -> CompletableFuture.supplyAsync(() ->
                                behandlingService.findAllByIdMapped(set)
                        , graphQLExectuor));
    }
}
