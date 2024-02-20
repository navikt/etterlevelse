package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

public class EtterlevelseDokumentasjonIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void getEtterlevelseDokumentasjon() {
        var etterlevelseDokumentasjon = etterlevelseDokumentasjonStorageService.save(EtterlevelseDokumentasjon.builder().title("test").build());

        var resp = restTemplate.getForEntity("/etterlevelsedokumentasjon/{id}", EtterlevelseDokumentasjonResponse.class, etterlevelseDokumentasjon.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponseResp = resp.getBody();
        assertThat(etterlevelseDokumentasjonResponseResp).isNotNull();
        assertThat(etterlevelseDokumentasjonResponseResp.getId()).isEqualTo(etterlevelseDokumentasjon.getId());
    }

    @Test
    void getEtterlevelseByNummer() {
        var etterlevelseDokumentasjon = etterlevelseDokumentasjonStorageService.save(EtterlevelseDokumentasjon.builder().title("test2").etterlevelseNummer(101).build());

        var resp = restTemplate.getForEntity("/etterlevelsedokumentasjon/search/{searchParam}", EtterlevelseDokumentasjonController.EtterlevelseDokumentasjonPage.class, etterlevelseDokumentasjon.getEtterlevelseNummer());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var body = resp.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getNumberOfElements()).isOne();

    }

    @Test
    void deleteEtterlevelseDokumentasjonAndChildren() {
        var etterlevelseDokumentasjon_1 = etterlevelseDokumentasjonStorageService.save(EtterlevelseDokumentasjon.builder().title("test1").etterlevelseNummer(101).build());
        var etterlevelseDokumentasjon_2 = etterlevelseDokumentasjonStorageService.save(EtterlevelseDokumentasjon.builder().title("test2").etterlevelseNummer(102).build());


        etterlevelseStorageService.save(Etterlevelse.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).build());
        etterlevelseStorageService.save(Etterlevelse.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).build());
        etterlevelseStorageService.save(Etterlevelse.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_2.getId().toString()).build());

        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_2.getId().toString()).build());

        etterlevelseMetadataStorageService.save(EtterlevelseMetadata.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).kravNummer(200).build());
        etterlevelseMetadataStorageService.save(EtterlevelseMetadata.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).kravNummer(200).build());
        etterlevelseMetadataStorageService.save(EtterlevelseMetadata.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_2.getId().toString()).kravNummer(200).build());

        restTemplate.delete("/etterlevelsedokumentasjon/{id}", etterlevelseDokumentasjon_1.getId());

        assertThat(etterlevelseDokumentasjonStorageService.getAll(EtterlevelseDokumentasjon.class)).isNotNull();
        assertThat(etterlevelseStorageService.getAll(Etterlevelse.class)).isNotNull();
        assertThat(etterlevelseMetadataStorageService.getAll(EtterlevelseMetadata.class)).isNotNull();
        assertThat(etterlevelseArkivStorageService.getAll(EtterlevelseArkiv.class)).isNotNull();

    }


}