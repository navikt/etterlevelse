package no.nav.data.etterlevelse.statistikk;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.TilbakemeldingService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.statistikk.domain.BehandlingStatistikk;
import no.nav.data.etterlevelse.statistikk.dto.KravStatistikkResponse;
import no.nav.data.etterlevelse.statistikk.dto.TilbakemeldingStatistikkResponse;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class StatistikkService {
    private final TilbakemeldingService tilbakemeldingService;
    private final BehandlingService behandlingService;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final TeamcatTeamClient teamService;

    public StatistikkService(TilbakemeldingService tilbakemeldingService,
                             BehandlingService behandlingService,
                             KravService kravService,
                             EtterlevelseService etterlevelseService,
                             EtterlevelseDokumentasjonService etterlevelseDokumentasjonService,
                             TeamcatTeamClient teamService) {
        this.tilbakemeldingService = tilbakemeldingService;
        this.behandlingService = behandlingService;
        this.kravService = kravService;
        this.etterlevelseService = etterlevelseService;
        this.etterlevelseDokumentasjonService = etterlevelseDokumentasjonService;
        this.teamService = teamService;
    }


    public int getAntallIkkeFiltrertKrav(List<Krav> aktivKravList, EtterlevelseDokumentasjon etterlevelseDokumentasjon, List<Etterlevelse> etterlevelseList) {

        List<Krav> valgteKrav = aktivKravList.stream().filter(krav -> !new HashSet<>(etterlevelseDokumentasjon.getIrrelevansFor()).containsAll(krav.getRelevansFor()) || krav.getRelevansFor().isEmpty()
        ).toList();

        return valgteKrav.size() +
                etterlevelseList.stream()
                        .filter(etterlevelse ->
                                valgteKrav.stream().noneMatch(krav -> krav.getKravVersjon().equals(etterlevelse.getKravVersjon()) &&
                                        krav.getKravNummer().equals(etterlevelse.getKravNummer()))
                        ).toList().size();
    }

    public LocalDateTime getCreatedDate(List<Etterlevelse> etterlevelseList) {
        etterlevelseList.sort(Comparator.comparing(a -> a.getChangeStamp().getCreatedDate()));
        return !etterlevelseList.isEmpty() ? etterlevelseList.get(0).getChangeStamp().getCreatedDate() : null;
    }

    public LocalDateTime getLastUpdatedDate(List<Etterlevelse> etterlevelseList) {
        etterlevelseList.sort(Comparator.comparing(a -> a.getChangeStamp().getLastModifiedDate()));
        return !etterlevelseList.isEmpty() ? etterlevelseList.get(etterlevelseList.size() - 1).getChangeStamp().getLastModifiedDate() : null;
    }

    public Page<TilbakemeldingStatistikkResponse> getAllTilbakemeldingStatistikk(Pageable page) {
        Page<Tilbakemelding> tilbakeMeldinger = tilbakemeldingService.getAll(page);
        List<TilbakemeldingStatistikkResponse> tilbakemeldingStatistikkResponses = new ArrayList<>();

        tilbakeMeldinger.forEach(tb -> {
            var tempKrav = kravService.getByKravNummer(tb.getKravNummer(), tb.getKravVersjon());
            if (tempKrav.isPresent()) {
                tilbakemeldingStatistikkResponses.add(TilbakemeldingStatistikkResponse.builder()
                        .kravTittel(tempKrav.get().getNavn())
                        .kravNummer(tb.getKravNummer())
                        .kravVersjon(tb.getKravVersjon())
                        .mottatt(tb.getMeldinger().get(0).getTid())
                        .besvart(tb.getStatus() == TilbakemeldingStatus.UBESVART ? null : tb.getMeldinger().get(tb.getMeldinger().size() - 1).getTid())
                        .fortTilKravEndring(tb.isEndretKrav())
                        .status(tb.getStatus().toString())
                        .build());
            }
        });
        return new PageImpl<>(tilbakemeldingStatistikkResponses, page, tilbakemeldingStatistikkResponses.size());
    }

    public Page<BehandlingStatistikk> getAllBehandlingStatistikk(Pageable page) {
        List<BehandlingStatistikk> behandlingStatistikkList = new ArrayList<>();

        AtomicInteger totalElements = new AtomicInteger();

        List<Krav> aktivKravList = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());

        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjoner = etterlevelseDokumentasjonService.getAllWithValidBehandling();

        etterlevelseDokumentasjoner.forEach(etterlevelseDokumentasjon -> {

            totalElements.addAndGet(etterlevelseDokumentasjon.getBehandlingIds().size());

            //Get all etterlevelse for behandling
            List<Etterlevelse> etterlevelseList = etterlevelseService.getByEtterlevelseDokumentasjon(String.valueOf(etterlevelseDokumentasjon.getId()));

            //Sort etterlevelse on created date to when the first documentation was created
            LocalDateTime opprettetDato = getCreatedDate(etterlevelseList);

            //Sort etterlevelse on updated date to when the documentation was last updated
            LocalDateTime endretDato = getLastUpdatedDate(etterlevelseList);

            //Filter etterlevelse to only have documentation for active Krav
            List<Etterlevelse> aktivEtterlevelseList = etterlevelseList.stream().filter(etterlevelse ->
                    aktivKravList.stream().anyMatch(krav -> krav.getKravNummer().equals(etterlevelse.getKravNummer()) && krav.getKravVersjon().equals(etterlevelse.getKravVersjon()))
            ).toList();

            int antallIkkeFiltrertKrav = getAntallIkkeFiltrertKrav(aktivKravList, etterlevelseDokumentasjon, aktivEtterlevelseList);

            List<Etterlevelse> antallFerdigDokumentert = aktivEtterlevelseList.stream()
                    .filter(etterlevelse ->
                            etterlevelse.getStatus().equals(EtterlevelseStatus.FERDIG_DOKUMENTERT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.OPPFYLLES_SENERE)
                    )
                    .toList();

            List<Etterlevelse> antallUnderArbeid = aktivEtterlevelseList.stream()
                    .filter(etterlevelse ->
                            etterlevelse.getStatus().equals(EtterlevelseStatus.UNDER_REDIGERING) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.IKKE_RELEVANT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.FERDIG)
                    )
                    .toList();

            int antallUnderArbeidSize = antallUnderArbeid.stream().filter(etterlevelseUnderArbeid ->
                    antallFerdigDokumentert.stream()
                            .noneMatch(e -> e.getKravNummer().equals(etterlevelseUnderArbeid.getKravNummer())
                                    && e.getKravVersjon().equals(etterlevelseUnderArbeid.getKravVersjon()))
            ).toList().size();


            etterlevelseDokumentasjon.getBehandlingIds().forEach(behandlingId -> {
                Behandling behandling = behandlingService.getBehandling(behandlingId);

                String behandlingNavn = "B" + behandling.getNummer() + " " + behandling.getNavn();

                List<String> teamNames = behandling.getTeams().stream().map(t -> teamService.getTeam(t).isPresent() ? teamService.getTeam(t).get().getName() : "").toList();

                behandlingStatistikkList.add(
                        BehandlingStatistikk.builder()
                                .behandlingId(behandling.getId())
                                .behandlingNavn(behandlingNavn)
                                .totalKrav(aktivKravList.size())
                                .antallIkkeFiltrertKrav(antallIkkeFiltrertKrav)
                                .antallBortfiltrertKrav(aktivKravList.size() - antallIkkeFiltrertKrav)
                                .antallFerdigDokumentert(antallFerdigDokumentert.size())
                                .antallUnderArbeid(antallUnderArbeidSize)
                                .antallIkkePaabegynt(antallIkkeFiltrertKrav - (antallFerdigDokumentert.size() + antallUnderArbeidSize))
                                .endretDato(endretDato)
                                .opprettetDato(opprettetDato)
                                .team(teamNames)
                                .build()
                );
            });
        });

        if ((page.getPageNumber() * page.getPageSize()) > behandlingStatistikkList.size()) {
            return new PageImpl<>(new ArrayList<>(), page, totalElements.get());
        }
        if ((page.getPageNumber() * page.getPageSize()) + page.getPageSize() >= behandlingStatistikkList.size()) {
            return new PageImpl<>(behandlingStatistikkList.subList(page.getPageNumber() * page.getPageSize(), behandlingStatistikkList.size()), page, totalElements.get());
        } else {
            return new PageImpl<>(behandlingStatistikkList.subList(page.getPageNumber() * page.getPageSize(), (page.getPageNumber() * page.getPageSize()) + page.getPageSize()), page, totalElements.get());
        }
    }

    public KravStatistikkResponse toKravStatestikkResponse(Krav krav) {
        var regelverkResponse = StreamUtils.convert(krav.getRegelverk(), Regelverk::toResponse);
        String temaName = "Ingen";
        if (regelverkResponse.size() > 0) {
            var temaData = CodelistService.getCodelist(ListName.TEMA, regelverkResponse.get(0).getLov().getData().get("tema").textValue());
            if (temaData != null) {
                temaName = temaData.getShortName();
            }
        }
        return KravStatistikkResponse.builder()
                .id(krav.getId())
                .lastModifedDate(krav.getChangeStamp().getLastModifiedDate())
                .createdDate(krav.getChangeStamp().getCreatedDate())
                .kravNummer(krav.getKravNummer())
                .kravVersjon(krav.getKravVersjon())
                .navn(krav.getNavn())
                .regelverk(regelverkResponse)
                .tagger(krav.getTagger())
                .suksesskriterier(StreamUtils.convert(krav.getSuksesskriterier(), Suksesskriterie::toResponse))
                .kravIdRelasjoner(krav.getKravIdRelasjoner())
                .avdeling(CodelistService.getCodelistResponse(ListName.AVDELING, krav.getAvdeling()))
                .underavdeling(CodelistService.getCodelistResponse(ListName.UNDERAVDELING, krav.getUnderavdeling()))
                .relevansFor(CodelistService.getCodelistResponseList(ListName.RELEVANS, krav.getRelevansFor()))
                .status(krav.getStatus())
                .aktivertDato(krav.getAktivertDato())
                .tema(temaName)
                .build();
    }

    public Page<Krav> getAllKravStatistics(Pageable page) {
        return kravService.getAllKravStatistics(page);
    }
}
