package no.nav.data.etterlevelse.melding;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.IntegrationTestBase;

import no.nav.data.etterlevelse.etterlevelsemetadata.EtterlevelseMetadataController;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.etterlevelse.melding.domain.MeldingStatus;
import no.nav.data.etterlevelse.melding.domain.MeldingType;
import no.nav.data.etterlevelse.melding.dto.MeldingResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
class MeldingControllerTest extends IntegrationTestBase {

    @Test
    void getAllMelding_createTwoMeldingRequest_getTwo() {
        storageService.save(Melding.builder().build());
        storageService.save(Melding.builder().build());

        var resp = restTemplate.getForEntity("/melding", MeldingController.MeldingPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResp = resp.getBody();
        assertThat(meldingResp).isNotNull();
        assertThat(meldingResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getById_createTwoMeldingReuqest_getOne() {
        var m1 = storageService.save(Melding.builder().meldingType(MeldingType.SYSTEM).meldingStatus(MeldingStatus.ACTIVE).melding("test melding").build());
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.DEACTIVE).build());

        var resp = restTemplate.getForEntity("/melding/" + m1.getId(), MeldingResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResp = resp.getBody();
        assertThat(meldingResp).isNotNull();
        assertThat(meldingResp.getId()).isEqualTo(m1.getId());
        assertThat(meldingResp.getMeldingType()).isEqualTo(MeldingType.SYSTEM);
        assertThat(meldingResp.getMelding()).isEqualTo("test melding");
        assertThat(meldingResp.getMeldingStatus()).isEqualTo(MeldingStatus.ACTIVE);

    }
}