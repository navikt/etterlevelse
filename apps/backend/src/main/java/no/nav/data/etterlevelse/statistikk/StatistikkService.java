package no.nav.data.etterlevelse.statistikk;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.statistikk.domain.BehandlingStatistikk;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
public class StatistikkService {

    private final BehandlingService behandlingService;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;

    private final TeamcatTeamClient teamService;

    public StatistikkService(BehandlingService behandlingService, KravService kravService, EtterlevelseService etterlevelseService, TeamcatTeamClient teamService) {
        this.behandlingService = behandlingService;
        this.kravService = kravService;
        this.etterlevelseService = etterlevelseService;
        this.teamService = teamService;
    }


    public List<Krav> getAntallIkkeFiltrertKrav(List<Krav> aktivKravList, Behandling behandling) {

        List<String> irrelevantFor = convert(behandling.getIrrelevansFor(), CodelistResponse::getCode);

        return aktivKravList.stream().filter(krav -> !new HashSet<>(irrelevantFor).containsAll(krav.getRelevansFor()) || krav.getRelevansFor().isEmpty()
        ).toList();
    }

    public List<BehandlingStatistikk> getAllBehandlingStatistikk() {
        List<BehandlingStatistikk> behandlingStatistikkList = new ArrayList<>();

        List<Krav> aktivKravList = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<Behandling> behandlingList = behandlingService.getAllBehandlingWithBehandlingData();
        behandlingList.forEach(behandling -> {
            String behandlingNavn = "B" + behandling.getNummer() + " " + behandling.getNavn();


            List<Etterlevelse> etterlevelseList = etterlevelseService.getByBehandling(behandling.getId());

            etterlevelseList.sort(Comparator.comparing(a -> a.getChangeStamp().getCreatedDate()));

            LocalDateTime opprettetDato = !etterlevelseList.isEmpty() ? etterlevelseList.get(0).getChangeStamp().getCreatedDate() : null;

            etterlevelseList.sort(Comparator.comparing(a -> a.getChangeStamp().getLastModifiedDate()));

            LocalDateTime endretDato = !etterlevelseList.isEmpty() ? etterlevelseList.get(etterlevelseList.size() - 1).getChangeStamp().getLastModifiedDate() : null;


            List<Krav> antallIkkeFiltrertKrav = getAntallIkkeFiltrertKrav(aktivKravList, behandling);

            List<Etterlevelse> aktivEtterlevelseList = etterlevelseList.stream().filter(etterlevelse ->
                    antallIkkeFiltrertKrav.stream().anyMatch(krav -> krav.getKravNummer().equals(etterlevelse.getKravNummer()) && krav.getKravVersjon().equals(etterlevelse.getKravVersjon()))
            ).toList();

            int antallFerdigDokumentert = aktivEtterlevelseList.stream()
                    .filter(etterlevelse ->
                            etterlevelse.getStatus().equals(EtterlevelseStatus.FERDIG_DOKUMENTERT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.OPPFYLLES_SENERE)
                    )
                    .toList().size();

            int antallUnderArbeid = aktivEtterlevelseList.stream()
                    .filter(etterlevelse ->
                            etterlevelse.getStatus().equals(EtterlevelseStatus.UNDER_REDIGERING) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.IKKE_RELEVANT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.FERDIG)
                    )
                    .toList().size();

            List<String> teamNames = behandling.getTeams().stream().map(t->teamService.getTeam(t).isPresent()?teamService.getTeam(t).get().getName():"").toList();

            behandlingStatistikkList.add(
                    BehandlingStatistikk.builder()
                            .behandlingId(behandling.getId())
                            .behandlingNavn(behandlingNavn)
                            .totalKrav(aktivKravList.size())
                            .antallIkkeFiltrertKrav(antallIkkeFiltrertKrav.size())
                            .antallBortfiltrertKrav(aktivKravList.size() - antallIkkeFiltrertKrav.size())
                            .antallFerdigDokumentert(antallFerdigDokumentert)
                            .antallUnderArbeid(antallUnderArbeid)
                            .antallIkkePaabegynt(antallIkkeFiltrertKrav.size() - (antallFerdigDokumentert + antallUnderArbeid))
                            .endretDato(endretDato)
                            .opprettetDato(opprettetDato)
                            .team(teamNames)
                            .build()
            );
        });


        return behandlingStatistikkList;
    }
}
