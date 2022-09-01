package no.nav.data.etterlevelse.etterlevelsearkiv;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivController;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;


class EtterlevelseArkivControllerTest extends IntegrationTestBase {
    @Test
    void getAllEtterlevelseArkiv_createTwoEtterlevelseArkiv_getTwoEtterlevelseArkiv() {
        storageService.save(EtterlevelseArkiv.builder().build());
        storageService.save(EtterlevelseArkiv.builder().build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivPage = resp.getBody();
        assertThat(etterlevelseArkivPage).isNotNull();
        assertThat(etterlevelseArkivPage.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getAllEtterlevelseArkiv_NotCreateEtterlevelseArkiv_DoNotGetEtterlevelseMetadata() {
        storageService.save(EtterlevelseArkiv.builder().build());
        storageService.save(EtterlevelseArkiv.builder().build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isNotEqualTo(0);
    }

    @Test
    void getByWebSakNummer_createTwoEtterlevelseArkivWithWebSakNummer_getOnlyOne() {
        storageService.save(EtterlevelseArkiv.builder().webSakNummer("20/123456").build());
        storageService.save(EtterlevelseArkiv.builder().webSakNummer("20/456789").build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/websaknummer?websakNummer=20/123456", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(1);
    }
}
