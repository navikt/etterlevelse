package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonStats;
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

    private final EtterlevelseService etterlevelseService;
    private final KravService kravService;


    public CompletableFuture<List<TeamResponse>> teamsData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse, DataFetchingEnvironment env) {
        DataLoader<String, TeamResponse> loader = env.getDataLoader(DataLoaderReg.TEAM);
        return loader.loadMany(etterlevelseDokumentasjonResponse.getTeams());
    }

    public CompletableFuture<List<EtterlevelseResponse>> etterlevelser(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, DataFetchingEnvironment env) {
        return LoaderUtils.get(env, ETTERLEVELSE_FOR_ETTERLEVELSEDOKUMENTASJON_LOADER, etterlevelseDokumentasjon.getId(), (List<Etterlevelse> e) -> convert(e, Etterlevelse::toResponse));
    }

    public CompletableFuture<LocalDateTime> sistEndretEtterlevelse(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, DataFetchingEnvironment env) {
        return LoaderUtils.get(env, ETTERLEVELSE_FOR_ETTERLEVELSEDOKUMENTASJON_LOADER, etterlevelseDokumentasjon.getId().toString(), this::sistEndret);
    }

    public EtterlevelseDokumentasjonStats stats(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon) {
        var relevans = etterlevelseDokumentasjon.getIrrelevansFor();

        // Temporarily disabled
        /*
       if (relevans.isEmpty()) {
            return BehandlingStats.empty();
        }
        */

        var etterlevelser = etterlevelseService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId().toString());
        var krav = convert(kravService.findForEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId().toString()), Krav::toResponse);

        krav.forEach(k -> {
            if (k.getEtterlevelser() != null) {
                k.setEtterlevelser(k.getEtterlevelser().stream().filter(e -> e.getEtterlevelseDokumentasjonId().equals(etterlevelseDokumentasjon.getId().toString())).toList());
            }
        });

        var irrelevantKrav = convert(kravService.findForEtterlevelseDokumentasjonIrrelevans(etterlevelseDokumentasjon.getId().toString()), Krav::toResponse);

        var fylt = filter(krav, k -> etterlevelser.stream().anyMatch(e -> e.isEtterleves() && e.kravId().equals(k.kravId())));
        var ikkeFylt = filter(krav, k -> !fylt.contains(k));

        var irrelevant = filter(irrelevantKrav, i -> !fylt.contains(i) && !ikkeFylt.contains(i));


        return EtterlevelseDokumentasjonStats.builder()
                .fyltKrav(fylt)
                .ikkeFyltKrav(ikkeFylt)
                .irrelevantKrav(irrelevant)
                .lovStats(convert(CodelistService.getCodelist(ListName.LOV), c -> EtterlevelseDokumentasjonStats.LovStatsDok.builder()
                        .lovCode(c.toResponse())
                        .fyltKrav(filter(fylt, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .ikkeFyltKrav(filter(ikkeFylt, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .irrelevantKrav(filter(irrelevant, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .build()))
                .build();
    }

    private LocalDateTime sistEndret(List<Etterlevelse> etterlevelser) {
        return etterlevelser.stream()
                .map(e -> e.getChangeStamp().getLastModifiedDate())
                .max(Comparator.comparing(Function.identity()))
                .orElse(null);
    }

}
