package no.nav.data.etterlevelse.melding;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.IntegrationTestBase;

import no.nav.data.etterlevelse.melding.domain.Melding;
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

}