package no.nav.data.etterlevelse.statistikk;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.statistikk.domain.BehandlingStatistikk;
import no.nav.data.etterlevelse.statistikk.dto.KravStatistikkResponse;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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


    public int getAntallIkkeFiltrertKrav(List<Krav> aktivKravList, Behandling behandling, List<Etterlevelse> etterlevelseList) {

        List<String> irrelevantFor = convert(behandling.getIrrelevansFor(), CodelistResponse::getCode);

        List<Krav> valgteKrav = aktivKravList.stream().filter(krav -> !new HashSet<>(irrelevantFor).containsAll(krav.getRelevansFor()) || krav.getRelevansFor().isEmpty()
        ).toList();

        return valgteKrav.size() +
                etterlevelseList.stream()
                        .filter(etterlevelse ->
                                valgteKrav.stream().noneMatch(krav -> krav.getKravVersjon().equals(etterlevelse.getKravVersjon()) &&
                                        krav.getKravNummer().equals(etterlevelse.getKravNummer()))
                        ).toList().size();
    }

    public LocalDateTime getCreatedDate(List<Etterlevelse> etterlevelseList){
        etterlevelseList.sort(Comparator.comparing(a -> a.getChangeStamp().getCreatedDate()));
        return !etterlevelseList.isEmpty() ? etterlevelseList.get(0).getChangeStamp().getCreatedDate() : null;
    }

    public LocalDateTime getLastUpdatedDate(List<Etterlevelse> etterlevelseList){
        etterlevelseList.sort(Comparator.comparing(a -> a.getChangeStamp().getLastModifiedDate()));
        return !etterlevelseList.isEmpty() ? etterlevelseList.get(etterlevelseList.size() - 1).getChangeStamp().getLastModifiedDate() : null;
    }

    public List<BehandlingStatistikk> getAllBehandlingStatistikk() {
        List<BehandlingStatistikk> behandlingStatistikkList = new ArrayList<>();

        List<Krav> aktivKravList = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<Behandling> behandlingList = behandlingService.getAllBehandlingWithBehandlingData();


        behandlingList.forEach(behandling -> {
            String behandlingNavn = "B" + behandling.getNummer() + " " + behandling.getNavn();

            //Get all etterlevelse for behandling
            List<Etterlevelse> etterlevelseList = etterlevelseService.getByBehandling(behandling.getId());

            //Sort etterlevelse on created date to when the first documentation was created
            LocalDateTime opprettetDato = getCreatedDate(etterlevelseList);

            //Sort etterlevelse on updated date to when the documentation was last updated
            LocalDateTime endretDato = getLastUpdatedDate(etterlevelseList);

            //Filter etterlevelse to only have documentation for active Krav
            List<Etterlevelse> aktivEtterlevelseList = etterlevelseList.stream().filter(etterlevelse ->
                    aktivKravList.stream().anyMatch(krav -> krav.getKravNummer().equals(etterlevelse.getKravNummer()) && krav.getKravVersjon().equals(etterlevelse.getKravVersjon()))
            ).toList();

            int antallIkkeFiltrertKrav = getAntallIkkeFiltrertKrav(aktivKravList, behandling, aktivEtterlevelseList);

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

            List<String> teamNames = behandling.getTeams().stream().map(t->teamService.getTeam(t).isPresent()?teamService.getTeam(t).get().getName():"").toList();


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


        return behandlingStatistikkList;
    }

    public KravStatistikkResponse toKravStatestikkResponse(Krav krav) {
        var regelverkResponse = StreamUtils.convert(krav.getRegelverk(), Regelverk::toResponse);
        String temaName = regelverkResponse.get(0).getLov().getData().get("tema").textValue();
        var temaData = CodelistService.getCodelist(ListName.TEMA, String.valueOf(regelverkResponse.get(0).getLov().getData().get("tema")));
        if(temaData != null) {
            temaName = temaData.getShortName();
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
        .suksesskriterier(StreamUtils.convert(krav.getSuksesskriterier(), Suksesskriterie::toResponse ))
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
