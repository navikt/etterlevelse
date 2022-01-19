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
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.etterlevelse.graphql.DataLoaderReg.ETTERLEVELSER_FOR_BEHANDLING_LOADER;

@Slf4j
@Component
@RequiredArgsConstructor
public class BehandlingFieldResolver implements GraphQLResolver<Behandling> {

    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;

    public CompletableFuture<List<TeamResponse>> teamsData(Behandling behandling, DataFetchingEnvironment env) {
        DataLoader<String, TeamResponse> loader = env.getDataLoader(DataLoaderReg.TEAM);
        return loader.loadMany(behandling.getTeams());
    }

    public BehandlingStats stats(Behandling behandling) {
        var relevans = behandling.getIrrelevansFor();

        // Temporarily disabled
        /*
       if (relevans.isEmpty()) {
            return BehandlingStats.empty();
        }
        */

        var etterlevelser = etterlevelseService.getByBehandling(behandling.getId());
        var krav = convert(kravService.findForBehandling(behandling.getId()), Krav::toResponse);
        var irrelevantKrav = convert(kravService.findForBehandlingIrrelevans(behandling.getId()), Krav::toResponse);

        log.warn("Getting irrelevantKrav");
        log.warn(irrelevantKrav.toString());

        var fylt = filter(krav, k -> etterlevelser.stream().anyMatch(e -> e.isEtterleves() && e.kravId().equals(k.kravId())));
        var ikkeFylt = filter(krav, k -> !fylt.contains(k));
        var irrelevantFylt = filter(irrelevantKrav, k -> etterlevelser.stream().anyMatch(e -> e.isEtterleves() && e.kravId().equals(k.kravId())));
        var irrelevantIkkeFylt = filter(irrelevantKrav, k -> !irrelevantFylt.contains(k));
        var irrelevant = Stream.concat(irrelevantFylt.stream(), irrelevantIkkeFylt.stream()).collect(Collectors.toList());


        return BehandlingStats.builder()
                .fyltKrav(fylt)
                .ikkeFyltKrav(ikkeFylt)
                .lovStats(convert(CodelistService.getCodelist(ListName.LOV), c -> LovStats.builder()
                        .lovCode(c.toResponse())
                        .fyltKrav(filter(fylt, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .ikkeFyltKrav(filter(ikkeFylt, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .irrelevantKrav(filter(irrelevant,k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .build()))
                .build();
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
