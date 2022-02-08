package no.nav.data.etterlevelse.etterlevelsemetadata;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@Slf4j
class EtterlevelseMetadataControllerTest extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

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
    void getByKravNummerAndKravVersjon() {
        storageService.save(EtterlevelseMetadata.builder().kravNummer(200).build());
        storageService.save(EtterlevelseMetadata.builder().kravNummer(150).build());

        var resp = restTemplate.getForEntity("/etterlevelsemetadata/kravnummer/200", EtterlevelseMetadataController.EtterlevelseMetadataPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var etterlevelseMetadataResp = resp.getBody();
        assertThat(etterlevelseMetadataResp).isNotNull();
        assertThat(etterlevelseMetadataResp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getByBehandlingId() {
    }

    @Test
    void createKravPrioritering() {
    }

    @Test
    void updateKravPrioritering() {
    }

    @Test
    void deleteKravPrioritering() {
    }

}