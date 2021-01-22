package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.graphql.DataLoaderReg;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import no.nav.data.integration.team.dto.Resource;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Component
@RequiredArgsConstructor
public class KravFieldResolver implements GraphQLResolver<KravResponse> {

    private static final String BEHANDLING_ID = "behandlingId";

    private final EtterlevelseService etterlevelseService;

    public List<EtterlevelseResponse> etterlevelser(KravResponse krav, boolean onlyForBehandling, DataFetchingEnvironment env) {
        Integer nummer = krav.getKravNummer();
        Integer versjon = krav.getKravVersjon();
        log.info("etterlevelse for krav {}.{}", nummer, versjon);

        var etterlevelser = etterlevelseService.getByKravNummer(nummer, versjon);
        if (onlyForBehandling) {
            String behandlingId = (String) env.getVariables().get(BEHANDLING_ID);
            if (behandlingId != null) {
                etterlevelser = filter(etterlevelser, e -> behandlingId.equals(e.getBehandlingId()));
            }
        }
        return convert(etterlevelser, Etterlevelse::toResponse);
    }

    public CompletableFuture<List<Resource>> kontaktPersonerData(KravResponse krav, DataFetchingEnvironment env) {
        Integer nummer = krav.getKravNummer();
        Integer versjon = krav.getKravVersjon();
        log.info("kontaktPersoner for krav {}.{}", nummer, versjon);

        DataLoader<String, Resource> loader = env.getDataLoader(DataLoaderReg.RESOURCES);
        return loader.loadMany(krav.getKontaktPersoner());
    }
}
