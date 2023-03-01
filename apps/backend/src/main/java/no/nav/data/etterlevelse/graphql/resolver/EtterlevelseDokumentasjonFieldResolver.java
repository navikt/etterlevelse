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
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.graphql.DataLoaderReg;
import no.nav.data.etterlevelse.graphql.support.LoaderUtils;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.integration.team.dto.TeamResponse;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.etterlevelse.graphql.DataLoaderReg.ETTERLEVELSE_FOR_ETTERLEVELSEDOKUMENTASJON_LOADER;

@Slf4j
@Component
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonFieldResolver implements GraphQLResolver<EtterlevelseDokumentasjonResponse> {

    public CompletableFuture<List<EtterlevelseResponse>> etterlevelser(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, DataFetchingEnvironment env) {
        return LoaderUtils.get(env, ETTERLEVELSE_FOR_ETTERLEVELSEDOKUMENTASJON_LOADER, etterlevelseDokumentasjon.getId(), (List<Etterlevelse> e) -> convert(e, Etterlevelse::toResponse));
    }

    public CompletableFuture<LocalDateTime> sistEndretEtterlevelse(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, DataFetchingEnvironment env) {
        return LoaderUtils.get(env, ETTERLEVELSE_FOR_ETTERLEVELSEDOKUMENTASJON_LOADER, etterlevelseDokumentasjon.getId(), this::sistEndret);
    }

    private LocalDateTime sistEndret(List<Etterlevelse> etterlevelser) {
        return etterlevelser.stream()
                .map(e -> e.getChangeStamp().getLastModifiedDate())
                .max(Comparator.comparing(Function.identity()))
                .orElse(null);
    }

}
