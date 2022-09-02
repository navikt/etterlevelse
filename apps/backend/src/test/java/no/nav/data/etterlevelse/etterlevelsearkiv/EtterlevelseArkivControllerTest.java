package no.nav.data.etterlevelse.etterlevelsearkiv;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivController;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivStatus;
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
    void getAllEtterlevelseArkiv_NotCreateEtterlevelseArkiv_DoNotGetEtterlevelseArkiv() {
        var resp = restTemplate.getForEntity("/etterlevelsearkiv", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(0);
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

    @Test
    void getByWebSakNummer_createTwoEtterlevelseArkivWithWebSakNummer_getNone() {
        storageService.save(EtterlevelseArkiv.builder().webSakNummer("20/123456").build());
        storageService.save(EtterlevelseArkiv.builder().webSakNummer("20/456789").build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/websaknummer?websakNummer=20/123450", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByStatus_createSixEtterlevelseArkivWithTilArkivering_getEtterlevelseArkivTaggedTIL_ARKIVERING() {
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/status?status=TIL_ARKIVERING", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(3);
    }

    @Test
    void getByStatus_createSixEtterlevelseArkivWithTilArkivering_getEtterlevelseArkivTaggedBEHANDLER_ARKIVERING() {
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/tilarkivering/false", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getByStatus_createSixEtterlevelseArkivWithTilArkivering_getEtterlevelseArkivTaggedARKIVERT() {
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/tilarkivering/false", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(1);
    }
}
