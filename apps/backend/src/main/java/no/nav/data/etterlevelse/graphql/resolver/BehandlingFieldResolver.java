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
import no.nav.data.etterlevelse.graphql.DataLoaderReg;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.integration.team.dto.TeamResponse;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.safeStream;

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
        var relevans = behandling.getRelevansFor();
        if (relevans.isEmpty()) {
            return BehandlingStats.empty();
        }

        var etterlevelser = etterlevelseService.getByBehandling(behandling.getId());
        var allKrav = kravService.findForBehandling(behandling.getId());
        /** TODO move this filtering to {@link no.nav.data.etterlevelse.krav.domain.KravRepoCustom#findBy} for BehandlingId */
        var krav = convert(filter(allKrav,
                k -> etterlevelser.stream().anyMatch(e -> e.kravId().equals(k.kravId()))
                        || allKrav.stream().noneMatch(k2 -> k2.getKravNummer().equals(k.getKravNummer()) && k2.getKravVersjon() > k.getKravVersjon())
        ), Krav::toResponse);

        var fylt = filter(krav, k -> etterlevelser.stream().anyMatch(e -> e.kravId().equals(k.kravId())));
        var ikkeFylt = filter(krav, k -> !fylt.contains(k));

        return BehandlingStats.builder()
                .fyltKrav(fylt)
                .ikkeFyltKrav(ikkeFylt)
                .lovStats(convert(CodelistService.getCodelist(ListName.LOV), c -> LovStats.builder()
                        .lovCode(c.toResponse())
                        .fyltKrav(filter(fylt, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .ikkeFyltKrav(filter(ikkeFylt, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .build()))
                .build();
    }

}
