package no.nav.data.etterlevelse.etterlevelsemetadata;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
class EtterlevelseMetadataControllerTest extends IntegrationTestBase {

    @Test
    void getAllEtterlevelseMetadata_createTwoEtterlevelseMetadata_getTwoEtterlevelseMetadata() {
        storageService.save(EtterlevelseMetadata.builder().build());
        storageService.save(EtterlevelseMetadata.builder().build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getAllEtterlevelseMetadata_NotCreateEtterlevelseMetadata_DoNotGetEtterlevelseMetadata() {
        storageService.save(EtterlevelseMetadata.builder().build());
        storageService.save(EtterlevelseMetadata.builder().build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isNotEqualTo(0);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelsemetaDataWithDifferentKravnummer_getOnlyOne() {
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).build());
        storageService.save(EtterlevelseMetadata.builder().kravNummer(150).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getById_createTwoEtterlevelsemetaData_getOnlyOne() {
        var em1 = storageService.save(EtterlevelseMetadata.builder()
                .kravNummer(200)
                .kravVersjon(1)
                .behandlingId("test")
                .build());
        var em2 = storageService.save(EtterlevelseMetadata.builder().kravNummer(150).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/" + em1.getId(), EtterlevelseMetadataResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getId()).isEqualTo(em1.getId());
        assertThat(etterlevelseMetadataResp.getKravNummer()).isEqualTo(em1.getKravNummer());
        assertThat(etterlevelseMetadataResp.getKravVersjon()).isEqualTo(em1.getKravVersjon());
        assertThat(etterlevelseMetadataResp.getBehandlingId()).isEqualTo(em1.getBehandlingId());
    }

    @Test
    void getById_createTwoEtterlevelsemetaData_getNone() {
        var em1 = storageService.save(EtterlevelseMetadata.builder()
                .kravNummer(200)
                .kravVersjon(1)
                .behandlingId("test")
                .build());
        var em2 = storageService.save(EtterlevelseMetadata.builder().kravNummer(150).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/test", EtterlevelseMetadataResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelseMetadataWithSameKravnummer_getTwo() {
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).build());
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelseMetadataWithSameKravnummer_getNoneOfThem() {
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).build());
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/300", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelseMetadataWithSameKravnummerWithDifferentVersion_getOneThem() {
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).kravVersjon(1).build());
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).kravVersjon(2).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200/1", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelseMetadataWithSameKravnummerWithDifferentVersion_getNoneOfthem() {
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).kravVersjon(1).build());
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).kravVersjon(2).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200/5", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByBehandlingId_creatingTwoEtterlevelseMetadataWithSameBehadlingsId_getTwoOfThem() {
        storageService.save(EtterlevelseMetadata.builder().behandlingId("test-b1").kravNummer(200).kravVersjon(1).build());
        storageService.save(EtterlevelseMetadata.builder().behandlingId("test-b1").kravNummer(180).kravVersjon(2).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/behandlingId/test-b1", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void createEtterlevelseMetadata() {
        var req = EtterlevelseMetadataRequest.builder()
                .behandlingId("behandling1")
                .kravNummer(200)
                .kravVersjon(1)
                .tildeltMed(List.of("Y123456 - Rogan, Joe"))
                .build();

        var resp = restTemplate.postForEntity("/etterlevelsemetadata", req, EtterlevelseMetadataResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();

        assertThat(etterlevelseMetadataResp.getId()).isNotNull();
        assertFields(etterlevelseMetadataResp);
    }

    @Test
    void updateEtterlevelseMetadata() {
        var etterlevelseMetadata = storageService.save(EtterlevelseMetadata.builder().kravNummer(200).kravVersjon(1).behandlingId("behandling1").tildeltMed(List.of("Y789012 - Doe, John")).build());

        var req = EtterlevelseMetadataRequest.builder()
                .behandlingId("behandling1")
                .kravNummer(200)
                .kravVersjon(1)
                .tildeltMed(List.of("Y123456 - Rogan, Joe"))
                .id(etterlevelseMetadata.getId().toString())
                .build();

        var resp = restTemplate.exchange("/etterlevelsemetadata/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseMetadataResponse.class, etterlevelseMetadata.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();

        assertThat(etterlevelseMetadataResp.getId()).isNotNull();
        assertThat(etterlevelseMetadataResp.getTildeltMed().get(0)).isEqualTo("Y123456 - Rogan, Joe");

    }

    @Test
    void updateEtterlevelseMetadata_invalidId() {
        var etterlevelseMetadata = storageService.save(EtterlevelseMetadata.builder().kravNummer(200).kravVersjon(1).behandlingId("behandling1").tildeltMed(List.of("Y789012 - Doe, John")).build());

        var req = EtterlevelseMetadataRequest.builder()
                .behandlingId("behandling1")
                .kravNummer(200)
                .kravVersjon(1)
                .tildeltMed(List.of("Y123456 - Rogan, Joe"))
                .id("test_invalid_id")
                .build();

        var resp = restTemplate.exchange("/etterlevelsemetadata/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseMetadataResponse.class, etterlevelseMetadata.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void deleteEtterlevelseMetadata() {
        var etterlevelseMetadata = storageService.save(EtterlevelseMetadata.builder().kravNummer(50).kravVersjon(1).build());
        restTemplate.delete("/etterlevelsemetadata/{id}", etterlevelseMetadata.getId());

        assertThat(storageService.getAll(EtterlevelseMetadata.class)).isEmpty();
    }

    private void assertFields(EtterlevelseMetadataResponse etterlevelse) {
        assertThat(etterlevelse.getChangeStamp()).isNotNull();
        assertThat(etterlevelse.getVersion()).isEqualTo(0);

        assertThat(etterlevelse.getBehandlingId()).isEqualTo("behandling1");
        assertThat(etterlevelse.getKravNummer()).isEqualTo(200);
        assertThat(etterlevelse.getKravVersjon()).isEqualTo(1);
        assertThat(etterlevelse.getTildeltMed().size()).isEqualTo(1);
        assertThat(etterlevelse.getTildeltMed().get(0)).isEqualTo("Y123456 - Rogan, Joe");
    }
}