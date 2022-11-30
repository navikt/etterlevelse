package no.nav.data.etterlevelse.statistikk;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StatistikkServiceTest extends IntegrationTestBase {


    @Autowired
    KravService kravService;
    @Autowired
    BehandlingService behandlingService;
    @Autowired
    EtterlevelseService etterlevelseService;

    @Autowired
    StatistikkService statistikkService;

    @Test
    void givenCodes_filterKrav_getKravBasedOnFilter(){
        List<Behandling> behandlingList=  new ArrayList<>();
        var krav1 = storageService.save(Krav.builder().navn("Krav1").relevansFor(List.of("SAK1")).kravNummer(50).status(KravStatus.AKTIV).build());
        var krav2 = storageService.save(Krav.builder().navn("Krav2").relevansFor(List.of("SAK2")).kravNummer(60).status(KravStatus.AKTIV).build());
        List<Krav> aktivKravList = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());

        behandlingList = behandlingService.getAllBehandlingWithBehandlingData();

        var behandling1 = Behandling.builder().id("123").irrelevansFor(Arrays.asList(CodelistResponse.builder().code("SAK1").build(),CodelistResponse.builder().code("SAK2").build())).build();
        var behandling2 = Behandling.builder().id("124").irrelevansFor(Arrays.asList(CodelistResponse.builder().code("SAK3").build(),CodelistResponse.builder().code("SAK2").build())).build();

        assertEquals(aktivKravList.size(),2);
        behandlingList.add(behandling1);
        behandlingList.add(behandling2);
        assertEquals(behandlingList.size(),2);

    }
}