package no.nav.data.etterlevelse.statistikk;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.statistikk.domain.BehandlingStatistikk;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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

    public List<BehandlingStatistikk> getAllBehandlingStatistikk() {
        List<BehandlingStatistikk> behandlingStatistikkListe = new ArrayList<>();

        List<Krav> aktivKravList = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        aktivKravList.size();

        return behandlingStatistikkListe;
    }
}
