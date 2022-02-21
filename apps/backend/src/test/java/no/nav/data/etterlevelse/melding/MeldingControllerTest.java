package no.nav.data.etterlevelse.melding;

import lombok.experimental.StandardException;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataResponse;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.etterlevelse.melding.domain.MeldingStatus;
import no.nav.data.etterlevelse.melding.domain.MeldingType;
import no.nav.data.etterlevelse.melding.dto.MeldingRequest;
import no.nav.data.etterlevelse.melding.dto.MeldingResponse;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestExecutionListeners;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
class MeldingControllerTest extends IntegrationTestBase {

    @Test
    void getAllMelding_createTwoMeldingRequest_getTwo() {
        storageService.save(Melding.builder().build());
        storageService.save(Melding.builder().build());

        var resp = restTemplate.getForEntity("/melding/", MeldingController.MeldingPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResp = resp.getBody();
        assertThat(meldingResp).isNotNull();
        assertThat(meldingResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getById_createTwoMeldingRequest_getOne() {
        var m1 = storageService.save(Melding.builder().meldingType(MeldingType.SYSTEM).meldingStatus(MeldingStatus.ACTIVE).melding("test melding").build());
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.DEACTIVE).build());

        var resp = restTemplate.getForEntity("/melding/{id}", MeldingResponse.class, m1.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResp = resp.getBody();
        assertThat(meldingResp).isNotNull();
        assertThat(meldingResp.getId()).isEqualTo(m1.getId());
        assertThat(meldingResp.getMeldingType()).isEqualTo(MeldingType.SYSTEM);
        assertThat(meldingResp.getMelding()).isEqualTo("test melding");
        assertThat(meldingResp.getMeldingStatus()).isEqualTo(MeldingStatus.ACTIVE);
    }

    @Test
    void getById_createMeldingRequest_getNone() {
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.DEACTIVE).build());

        var resp = restTemplate.getForEntity("/melding/{id}", MeldingResponse.class,"test" );
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void getByMeldingType_createThreeMelding_getTwo() {
        storageService.save(Melding.builder().meldingType(MeldingType.SYSTEM).build());
        storageService.save(Melding.builder().meldingType(MeldingType.SYSTEM).build());
        storageService.save(Melding.builder().meldingType(MeldingType.FORSIDE).build());

        var resp = restTemplate.getForEntity("/melding/type/{meldingType}", MeldingController.MeldingPage.class, MeldingType.SYSTEM.toString());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResp = resp.getBody();
        assertThat(meldingResp.getNumberOfElements()).isEqualTo(2);
        assertThat(meldingResp.getContent().get(0).getMeldingType()).isEqualTo(MeldingType.SYSTEM);
    }

    @Test
    void getByMeldingType_createThreeMelding_getNone() {
        storageService.save(Melding.builder().meldingType(MeldingType.FORSIDE).build());
        storageService.save(Melding.builder().meldingType(MeldingType.FORSIDE).build());
        storageService.save(Melding.builder().meldingType(MeldingType.FORSIDE).build());

        var resp = restTemplate.getForEntity("/melding/type/{meldingType}", MeldingController.MeldingPage.class, MeldingType.SYSTEM.toString());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResp = resp.getBody();
        assertThat(meldingResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByMeldingStatus_createThreeMeldingStatus_getTwo() {
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.ACTIVE).build());
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.ACTIVE).build());
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.DEACTIVE).build());

        var resp = restTemplate.getForEntity("/melding/status/{meldingStatus}", MeldingController.MeldingPage.class, MeldingStatus.ACTIVE.toString());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResp = resp.getBody();
        assertThat(meldingResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getByMeldingStatus_createThreeMeldingStatus_getNone() {
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.DEACTIVE).build());
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.DEACTIVE).build());
        storageService.save(Melding.builder().meldingStatus(MeldingStatus.DEACTIVE).build());

        var resp = restTemplate.getForEntity("/melding/status/{meldingStatus}", MeldingController.MeldingPage.class, MeldingStatus.ACTIVE.toString());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResp = resp.getBody();
        assertThat(meldingResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void createMelding_createOneMelding_success() {
        var req = MeldingRequest.builder().melding("Test melding").meldingType(MeldingType.SYSTEM).meldingStatus(MeldingStatus.ACTIVE).build();

        var resp = restTemplate.postForEntity("/melding", req, MeldingResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        var meldingResponse = resp.getBody();
        assertThat(meldingResponse).isNotNull();

        assertThat(meldingResponse.getId()).isNotNull();
        assertFields(meldingResponse);
    }

    @Test
    void updateMelding_updateOneMelding_success() {
        var melding = storageService.save(Melding.builder().melding("Test update").meldingType(MeldingType.FORSIDE).meldingStatus(MeldingStatus.DEACTIVE).build());
        var req = MeldingRequest.builder().id(melding.getId().toString()).melding("Test melding").meldingType(MeldingType.SYSTEM).meldingStatus(MeldingStatus.ACTIVE).build();

        var resp = restTemplate.exchange("/melding/{id}", HttpMethod.PUT, new HttpEntity<>(req), MeldingResponse.class, melding.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var meldingResponse = resp.getBody();
        assertThat(meldingResponse).isNotNull();

        assertThat(meldingResponse.getId()).isNotNull();
        assertThat(meldingResponse.getMelding()).isEqualTo("Test melding");
        assertThat(meldingResponse.getMeldingType()).isEqualTo(MeldingType.SYSTEM);
        assertThat(meldingResponse.getMeldingStatus()).isEqualTo(MeldingStatus.ACTIVE);
    }



    private void assertFields(@NotNull MeldingResponse melding) {
        assertThat(melding.getChangeStamp()).isNotNull();
        assertThat(melding.getVersion()).isEqualTo(0);

        assertThat(melding.getMelding()).isEqualTo("Test update");
        assertThat(melding.getMeldingType()).isEqualTo(MeldingType.FORSIDE);
        assertThat(melding.getMeldingStatus()).isEqualTo(MeldingStatus.DEACTIVE);
    }



}