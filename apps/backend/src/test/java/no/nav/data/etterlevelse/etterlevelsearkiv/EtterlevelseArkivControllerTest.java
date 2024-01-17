package no.nav.data.etterlevelse.etterlevelsearkiv;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivController;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivStatus;
import no.nav.data.etterlevelse.arkivering.dto.ArkiverRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivResponse;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;


class EtterlevelseArkivControllerTest extends IntegrationTestBase {


    @Test
    void getEtterlevelseArkiv() {
        var etterlevelseArkiv = etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/{id}", EtterlevelseArkivResponse.class, etterlevelseArkiv.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseArkivResponse etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
    }
    @Test
    void getAllEtterlevelseArkiv_createTwoEtterlevelseArkiv_getTwoEtterlevelseArkiv() {
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

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
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().webSakNummer("20/123456").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().webSakNummer("20/456789").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/websaknummer?websakNummer=20/123456", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByWebSakNummer_createTwoEtterlevelseArkivWithWebSakNummer_getNone() {
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().webSakNummer("20/123456").build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().webSakNummer("20/456789").build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/websaknummer?websakNummer=20/123450", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByStatus_createSixEtterlevelseArkivWithTilArkivering_getEtterlevelseArkivTaggedTIL_ARKIVERING() {
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/status?status=TIL_ARKIVERING", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(3);
    }

    @Test
    void getByStatus_createSixEtterlevelseArkivWithTilArkivering_getEtterlevelseArkivTaggedBEHANDLER_ARKIVERING() {
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/status?status=BEHANDLER_ARKIVERING", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getByStatus_createSixEtterlevelseArkivWithTilArkivering_getEtterlevelseArkivTaggedARKIVERT() {
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/status?status=ARKIVERT", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByEtterlevelseDokumentasjonId_createTwoEtterlevelseArkiv_getOne(){
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId("123").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId("456").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/etterlevelsedokumentasjon/123", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByEtterlevelseDokumentasjonId_createTwoEtterlevelseArkiv_getTwo(){
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId("123").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId("123").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/etterlevelsedokumentasjon/123", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getByBehandlingsId_createTwoEtterlevelseArkiv_getNone(){
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId("789").build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId("456").build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/etterlevelsedokumentasjon/123", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void createEtterlevelseArkiv() {
        Krav krav = kravStorageService.save(Krav.builder().kravNummer(50).kravVersjon(1).status(KravStatus.AKTIV).build());
        etterlevelseStorageService.save(Etterlevelse.builder().etterlevelseDokumentasjonId("test_dok").kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon()).build());
        var req = EtterlevelseArkivRequest.builder()
                .etterlevelseDokumentasjonId("test_dok")
                .status(EtterlevelseArkivStatus.TIL_ARKIVERING)
                .webSakNummer("test/websak")
                .build();

        var resp = restTemplate.postForEntity("/etterlevelsearkiv", req, EtterlevelseArkivResponse.class);


        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        var etterlevelseArkiv = resp.getBody();
        assertThat(etterlevelseArkiv).isNotNull();

        assertThat(etterlevelseArkiv.getId()).isNotNull();
        assertFields(etterlevelseArkiv);
    }

    @Test
    void deleteEtterlevelse() {
        var etterlevelseArkiv = etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).webSakNummer("test/websak").behandlingId("test_Behandling").build());
        restTemplate.delete("/etterlevelsearkiv/{id}", etterlevelseArkiv.getId());

        assertThat(etterlevelseArkivStorageService.getAll(EtterlevelseArkiv.class)).isEmpty();
    }

    @Test
    void updateEtterlevelseArkiv() {
        var krav = kravStorageService.save(Krav.builder().kravNummer(50).kravVersjon(1).status(KravStatus.AKTIV).build());
        etterlevelseStorageService.save(Etterlevelse.builder().etterlevelseDokumentasjonId("test_dok").kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon()).build());
        var etterlevelseArkiv = etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).webSakNummer("test/websak").etterlevelseDokumentasjonId("test_dok").build());
        var req = EtterlevelseArkivRequest.builder()
                .id(etterlevelseArkiv.getId().toString())
                .status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING)
                .webSakNummer("test/websak")
                .etterlevelseDokumentasjonId("test_dok")
                .build();

        var resp = restTemplate.exchange("/etterlevelsearkiv/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseArkivResponse.class, etterlevelseArkiv.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseArkivResponse etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getStatus()).isEqualTo(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING.name());
    }


    @Test
    void arkiver_createSixEtterlevelseArkiv_getTwoWithUpdatedStatus() {
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());

        List<String> failed = new ArrayList<>();
        ArkiverRequest req = ArkiverRequest.builder().failedToArchiveEtterlevelseNr(failed).build();

        var resp = restTemplate.exchange("/etterlevelsearkiv/status/arkivert",HttpMethod.PUT, new HttpEntity<>(req),EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(2);
    }

    private void assertFields(EtterlevelseArkivResponse etterlevelseArkiv) {
        assertThat(etterlevelseArkiv.getChangeStamp()).isNotNull();
        assertThat(etterlevelseArkiv.getVersion()).isEqualTo(0);

        assertThat(etterlevelseArkiv.getEtterlevelseDokumentasjonId()).isEqualTo("test_dok");
        assertThat(etterlevelseArkiv.getStatus()).isEqualTo(EtterlevelseArkivStatus.TIL_ARKIVERING.name());
        assertThat(etterlevelseArkiv.getWebSakNummer()).isEqualTo("test/websak");
    }

}
