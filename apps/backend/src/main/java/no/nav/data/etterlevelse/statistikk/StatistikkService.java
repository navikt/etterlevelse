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
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
public class StatistikkService {
    private final BehandlingService behandlingService;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;

    public StatistikkService(BehandlingService behandlingService, KravService kravService, EtterlevelseService etterlevelseService) {
        this.behandlingService = behandlingService;
        this.kravService = kravService;
        this.etterlevelseService = etterlevelseService;
    }


    public int getAntallIkkeFiltrertKrav(List<Krav> aktivKravList,List<Etterlevelse> etterlevelseList, Behandling behandling){

        List<String> irrelevantFor = convert(behandling.getIrrelevansFor(), CodelistResponse::getCode);

        List<Krav> valgteKrav = aktivKravList.stream().filter(krav -> krav.getRelevansFor().stream().noneMatch(irrelevantFor::contains)
        ).toList();

        return valgteKrav.size() +
                etterlevelseList.stream()
                        .filter(etterlevelse ->
                                valgteKrav.stream().noneMatch(krav -> krav.getKravVersjon().equals(etterlevelse.getKravVersjon()) &&
                                        krav.getKravNummer().equals(etterlevelse.getKravNummer()))
                        ).toList().size();
    }

    public List<BehandlingStatistikk> getAllBehandlingStatistikk() {
        List<BehandlingStatistikk> behandlingStatistikkList = new ArrayList<>();

        List<Krav> aktivKravList = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<Behandling> behandlingList = behandlingService.getAllBehandlingWithBehandlingData();
        behandlingList.forEach(behandling -> {
            String behandlingNavn = "B" + behandling.getNummer() + " " + behandling.getNavn();


            List<Etterlevelse> etterlevelseList = etterlevelseService.getByBehandling(behandling.getId())
                    .stream().filter( etterlevelse ->
                        aktivKravList.stream().anyMatch(krav -> krav.getKravNummer().equals(etterlevelse.getKravNummer()) && krav.getKravVersjon().equals(etterlevelse.getKravVersjon()))
                    ).toList();

            int antallIkkeFiltrertKrav = getAntallIkkeFiltrertKrav(aktivKravList,etterlevelseList, behandling);

            int antallFerdigDokumentert = etterlevelseList.stream()
                    .filter(etterlevelse ->
                            etterlevelse.getStatus().equals(EtterlevelseStatus.FERDIG_DOKUMENTERT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.OPPFYLLES_SENERE)
                    )
                    .toList().size();

            behandlingStatistikkList.add(
                    BehandlingStatistikk.builder()
                            .behandlingId(behandling.getId())
                            .behandlingNavn(behandlingNavn)
                            .totalKrav(aktivKravList.size())
                            .antallIkkeFiltrertKrav(antallIkkeFiltrertKrav)
                            .antallBortfiltrertKrav(aktivKravList.size() - antallIkkeFiltrertKrav)
                            .antallFerdigDokumentert(antallFerdigDokumentert)
                            .antallUnderArbeid(etterlevelseList.size() - antallFerdigDokumentert)
                            .antallIkkePåbegynt(antallIkkeFiltrertKrav - etterlevelseList.size())
                            .build()
            );
        });


        return behandlingStatistikkList;
    }
}
