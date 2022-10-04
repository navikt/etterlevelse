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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;


class EtterlevelseArkivControllerTest extends IntegrationTestBase {


    @Test
    void getEtterlevelseArkiv() {
        var etterlevelseArkiv = storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/{id}", EtterlevelseArkivResponse.class, etterlevelseArkiv.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseArkivResponse etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
    }
    @Test
    void getAllEtterlevelseArkiv_createTwoEtterlevelseArkiv_getTwoEtterlevelseArkiv() {
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

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
        storageService.save(EtterlevelseArkiv.builder().webSakNummer("20/123456").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().webSakNummer("20/456789").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

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

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/status?status=BEHANDLER_ARKIVERING", EtterlevelseArkivController.EtterlevelseArkivPage.class);
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

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/status?status=ARKIVERT", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByBehandlingsId_createTwoEtterlevelseArkiv_getOne(){
        storageService.save(EtterlevelseArkiv.builder().behandlingId("123").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().behandlingId("456").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/behandling/123", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByBehandlingsId_createTwoEtterlevelseArkiv_getTwo(){
        storageService.save(EtterlevelseArkiv.builder().behandlingId("123").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().behandlingId("123").status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/behandling/123", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getByBehandlingsId_createTwoEtterlevelseArkiv_getNone(){
        storageService.save(EtterlevelseArkiv.builder().behandlingId("789").build());
        storageService.save(EtterlevelseArkiv.builder().behandlingId("456").build());

        var resp = restTemplate.getForEntity("/etterlevelsearkiv/behandling/123", EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void createEtterlevelseArkiv() {
        var krav = storageService.save(Krav.builder().kravNummer(50).kravVersjon(1).status(KravStatus.AKTIV).build());
        storageService.save(Etterlevelse.builder().behandlingId("test_behandling").kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon()).build());
        var req = EtterlevelseArkivRequest.builder()
                .behandlingId("test_behandling")
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
        var etterlevelseArkiv = storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).webSakNummer("test/websak").behandlingId("test_Behandling").build());
        restTemplate.delete("/etterlevelsearkiv/{id}", etterlevelseArkiv.getId());

        assertThat(storageService.getAll(EtterlevelseArkiv.class)).isEmpty();
    }

    @Test
    void updateEtterlevelseArkiv() {
        var krav = storageService.save(Krav.builder().kravNummer(50).kravVersjon(1).status(KravStatus.AKTIV).build());
        storageService.save(Etterlevelse.builder().behandlingId("test_Behandling").kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon()).build());
        var etterlevelseArkiv = storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).webSakNummer("test/websak").behandlingId("test_Behandling").build());
        var req = EtterlevelseArkivRequest.builder()
                .id(etterlevelseArkiv.getId().toString())
                .status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING)
                .webSakNummer("test/websak")
                .behandlingId("test_Behandling")
                .build();

        var resp = restTemplate.exchange("/etterlevelsearkiv/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseArkivResponse.class, etterlevelseArkiv.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseArkivResponse etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getStatus()).isEqualTo(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING.name());
    }

    @Test
    void arkiver_createSixEtterlevelseArkiv_getTwoWithUpdatedStatus() {
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.TIL_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING).build());
        storageService.save(EtterlevelseArkiv.builder().status(EtterlevelseArkivStatus.ARKIVERT).build());



        List<String> failed = new ArrayList<>();
        var headers = new HttpHeaders();
        headers.setBearerAuth("test");
        ArkiverRequest req = ArkiverRequest.builder().failedToAchiveBehandlingsNr(failed).build();

        HttpEntity<ArkiverRequest> request = new HttpEntity<>(req, headers);


        var resp = restTemplate.exchange("/etterlevelsearkiv/status/arkivert",HttpMethod.PUT, request,EtterlevelseArkivController.EtterlevelseArkivPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseArkivResp = resp.getBody();
        assertThat(etterlevelseArkivResp).isNotNull();
        assertThat(etterlevelseArkivResp.getNumberOfElements()).isEqualTo(2);
    }

    private void assertFields(EtterlevelseArkivResponse etterlevelseArkiv) {
        assertThat(etterlevelseArkiv.getChangeStamp()).isNotNull();
        assertThat(etterlevelseArkiv.getVersion()).isEqualTo(0);

        assertThat(etterlevelseArkiv.getBehandlingId()).isEqualTo("test_behandling");
        assertThat(etterlevelseArkiv.getStatus()).isEqualTo(EtterlevelseArkivStatus.TIL_ARKIVERING.name());
        assertThat(etterlevelseArkiv.getWebSakNummer()).isEqualTo("test/websak");
    }

}
