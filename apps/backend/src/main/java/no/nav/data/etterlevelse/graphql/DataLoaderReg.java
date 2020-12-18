package no.nav.data.etterlevelse.graphql;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.function.Function;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoaderReg {

    public static final String BEHANDLING = "BEHANDLING_LOADER";
    public static final String RESOURCES = "RESOURCES_LOADER";

    private final Executor graphQLExecutor;
    private final BehandlingService behandlingService;
    private final TeamcatResourceClient resourceClient;

    public DataLoaderRegistry create() {
        return new DataLoaderRegistry()
                .register(BEHANDLING, behandlingLoader())
                .register(RESOURCES, resourcesLoader())
                ;
    }

    private DataLoader<String, Behandling> behandlingLoader() {
        return loader(behandlingService::findAllByIdMapped);
    }

    private DataLoader<String, Resource> resourcesLoader() {
        return loader(resourceClient::getResources);
    }

    private <ID, R> DataLoader<ID, R> loader(Function<Set<ID>, Map<ID, R>> supplier) {
        return DataLoader.newMappedDataLoader(
                (Set<ID> set) -> CompletableFuture.supplyAsync(() -> supplier.apply(set), graphQLExecutor)
        );
    }

}
