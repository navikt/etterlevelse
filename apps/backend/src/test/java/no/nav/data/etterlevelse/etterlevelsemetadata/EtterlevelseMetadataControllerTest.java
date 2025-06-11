package no.nav.data.etterlevelse.etterlevelsemetadata;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class EtterlevelseMetadataControllerTest extends IntegrationTestBase {

    @Test
    void getAllEtterlevelseMetadata_createTwoEtterlevelseMetadata_getTwoEtterlevelseMetadata() {
        createEtterlevelseMetadata(200, 1);
        createEtterlevelseMetadata(201, 1);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getAllEtterlevelseMetadata_NotCreateEtterlevelseMetadata_DoNotGetEtterlevelseMetadata() {
        var resp = restTemplate.getForEntity("/etterlevelsemetadata", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelsemetaDataWithDifferentKravnummer_getOnlyOne() {
        createEtterlevelseMetadata(200, 1);
        createEtterlevelseMetadata(150, 1);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByEtterlevelseDokumentasjonAndKrav_createTwoEtterlevelseMetadataWithDifferentEtterlevelseDokumentasjonId_getOnlyOne() {
        UUID etterlevelseDokumentasjonId = createEtterlevelseMetadata(200, 1).getEtterlevelseDokumentasjonId();
        createEtterlevelseMetadata(200, 1);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/etterlevelseDokumentasjon/{ettDokId}/200", EtterlevelseMetadataController.EtterlevelseMetadataPage.class, etterlevelseDokumentasjonId);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByEtterlevelseDokumentasjonAndKrav_createTwoEtterlevelseMetadataWithDifferentEtterlevelseDokumentasjonId_getTwo() {
        UUID etterlevelseDokumentasjonId = createEtterlevelseMetadata(200, 1).getEtterlevelseDokumentasjonId();
        createEtterlevelseMetadata(etterlevelseDokumentasjonId, 200, 2);
        createEtterlevelseMetadata(200, 1);
        
        var resp = restTemplate.getForEntity("/etterlevelsemetadata/etterlevelseDokumentasjon/{ettDokId}/200", EtterlevelseMetadataController.EtterlevelseMetadataPage.class, etterlevelseDokumentasjonId);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getByEtterlevelseDokumentasjonAndKrav_createOneEtterlevelseMetadata_getNone() {
        createEtterlevelseMetadata(200, 1).getEtterlevelseDokumentasjonId();

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/etterlevelseDokumentasjon/{ettDokId}/200", EtterlevelseMetadataController.EtterlevelseMetadataPage.class, UUID.randomUUID());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByEtterlevelseDokumentasjonAndKrav_createOneEtterlevelseMetadataWithKravNummerAndKravVersjon_getNone() {
        UUID etterlevelseDokumentasjonId = createEtterlevelseMetadata(200, 1).getEtterlevelseDokumentasjonId();

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/etterlevelseDokumentasjon/{ettDokId}/200/2", EtterlevelseMetadataController.EtterlevelseMetadataPage.class, etterlevelseDokumentasjonId);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getById_createTwoEtterlevelseMetadata_getOnlyOne() {
        EtterlevelseMetadata em1 = createEtterlevelseMetadata(200, 1);
        createEtterlevelseMetadata(150, 1);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/" + em1.getId(), EtterlevelseMetadataResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getId()).isEqualTo(em1.getId());
        assertThat(etterlevelseMetadataResp.getKravNummer()).isEqualTo(em1.getKravNummer());
        assertThat(etterlevelseMetadataResp.getKravVersjon()).isEqualTo(em1.getKravVersjon());
    }

    @Test
    void getById_createTwoEtterlevelseMetadata_getNone() {
        createEtterlevelseMetadata(200, 1);
        createEtterlevelseMetadata(150, 1);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/" + UUID.randomUUID(), EtterlevelseMetadataResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelseMetadataWithSameKravnummer_getTwo() {
        createEtterlevelseMetadata(200, 1);
        createEtterlevelseMetadata(200, 1);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelseMetadataWithSameKravnummer_getNoneOfThem() {
        createEtterlevelseMetadata(200, 1);
        createEtterlevelseMetadata(200, 1);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/300", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelseMetadataWithSameKravnummerWithDifferentVersion_getOneThem() {
        createEtterlevelseMetadata(200, 1);
        createEtterlevelseMetadata(200, 2);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200/1", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByKravNummerAndKravVersjon_createTwoEtterlevelseMetadataWithSameKravnummerWithDifferentVersion_getNoneOfthem() {
        createEtterlevelseMetadata(200, 1);
        createEtterlevelseMetadata(200, 2);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200/5", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(0);
    }

    @Test
    void getByEtterlevelseDokumentasjonId_creatingTwoEtterlevelseMetadataWithSameEtterlevelseDokumentasjonId_getTwoOfThem() {
        UUID etterlevelseDokumentasjonId = createEtterlevelseMetadata(200, 1).getEtterlevelseDokumentasjonId();
        createEtterlevelseMetadata(etterlevelseDokumentasjonId, 180, 2);

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/etterlevelseDokumentasjon/" + etterlevelseDokumentasjonId, EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void testCreateEtterlevelseMetadata() {
        UUID etterlevelseDokumentasjonId = createEtterlevelseDokumentasjon().getId();
        createKrav("Krav 1", 200, 1);
        var req = EtterlevelseMetadataRequest.builder()
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .kravNummer(200)
                .kravVersjon(1)
                .tildeltMed(List.of("Y123456 - Rogan, Joe"))
                .build();

        var resp = restTemplate.postForEntity("/etterlevelsemetadata", req, EtterlevelseMetadataResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();

        assertThat(etterlevelseMetadataResp.getId()).isNotNull();
        assertThat(etterlevelseMetadataRepo.count()).isOne();
    }

    @Test
    void updateEtterlevelseMetadata() {
        var em = createEtterlevelseMetadata(200, 1);
        em.setTildeltMed(List.of("Y789012 - Doe, John"));
        em = etterlevelseMetadataRepo.save(em);

        var req = EtterlevelseMetadataRequest.builder()
                .etterlevelseDokumentasjonId(em.getEtterlevelseDokumentasjonId())
                .kravNummer(200)
                .kravVersjon(1)
                .tildeltMed(List.of("Y123456 - Rogan, Joe"))
                .id(em.getId())
                .build();

        var resp = restTemplate.exchange("/etterlevelsemetadata/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseMetadataResponse.class, em.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();

        assertThat(etterlevelseMetadataResp.getId()).isNotNull();
        assertThat(etterlevelseMetadataResp.getTildeltMed().get(0)).isEqualTo("Y123456 - Rogan, Joe");

    }

    @Test
    void deleteEtterlevelseMetadata() {
        var em = createEtterlevelseMetadata(50, 1);
        restTemplate.delete("/etterlevelsemetadata/{id}", em.getId());

        assertThat(etterlevelseMetadataRepo.findAll()).isEmpty();
    }
 
}