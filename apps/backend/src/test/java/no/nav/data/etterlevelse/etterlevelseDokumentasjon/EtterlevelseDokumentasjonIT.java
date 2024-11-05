package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class EtterlevelseDokumentasjonIT extends IntegrationTestBase {

    @Autowired
    EtterlevelseRepo etterlevelseRepo;
    
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


        etterlevelseService.save(Etterlevelse.builder().kravNummer(200).kravVersjon(1).etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).build());
        etterlevelseService.save(Etterlevelse.builder().kravNummer(201).kravVersjon(1).etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).build());
        etterlevelseService.save(Etterlevelse.builder().kravNummer(200).kravVersjon(1).etterlevelseDokumentasjonId(etterlevelseDokumentasjon_2.getId().toString()).build());

        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).build());
        etterlevelseArkivStorageService.save(EtterlevelseArkiv.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_2.getId().toString()).build());

        etterlevelseMetadataStorageService.save(EtterlevelseMetadata.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).kravNummer(200).build());
        etterlevelseMetadataStorageService.save(EtterlevelseMetadata.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId().toString()).kravNummer(201).build());
        etterlevelseMetadataStorageService.save(EtterlevelseMetadata.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon_2.getId().toString()).kravNummer(200).build());

        restTemplate.delete("/etterlevelsedokumentasjon/{id}", etterlevelseDokumentasjon_1.getId());

        assertThat(etterlevelseDokumentasjonStorageService.getAll(EtterlevelseDokumentasjon.class).size()).isEqualTo(1); // Only etterlevelseDokumentasjon_2 should remain
        assertThat(etterlevelseService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon_1.getId().toString()).size()).isEqualTo(0);
        assertThat(etterlevelseMetadataService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon_1.getId().toString()).size()).isEqualTo(0);
        assertThat(etterlevelseArkivService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon_1.getId().toString()).size()).isEqualTo(0);
    }

    @Test
    void shouldOnlyUpdatePrioritertKravNummerWithoutOverwrittingOtherFields() {
        var etterlevelseDokumentasjon_1 = etterlevelseDokumentasjonService.save(
                EtterlevelseDokumentasjonRequest.builder()
                        .title("test dokumentasjon")
                        .etterlevelseNummer(101)
                        .knyttetTilVirkemiddel(false)
                        .virkemiddelId("")
                        .beskrivelse("")
                        .forGjenbruk(false)
                        .teams(List.of(""))
                        .resources(List.of(""))
                        .risikoeiere(List.of(""))
                        .irrelevansFor(List.of(""))
                        .update(false)
                        .behandlerPersonopplysninger(true)
                        .behandlingIds(List.of(""))
                        .prioritertKravNummer(List.of())
                        .varslingsadresser(List.of())
                        .build()
        );

        etterlevelseDokumentasjon_1.setPrioritertKravNummer(List.of("test"));

        var updatedEtterlevelseDokumentasjon = etterlevelseDokumentasjonStorageService.save(etterlevelseDokumentasjon_1);

        assertThat(updatedEtterlevelseDokumentasjon.getId()).isEqualTo(etterlevelseDokumentasjon_1.getId());
        assertThat(updatedEtterlevelseDokumentasjon.getTitle()).isEqualTo(etterlevelseDokumentasjon_1.getTitle());
        assertThat(updatedEtterlevelseDokumentasjon.getPrioritertKravNummer()).isEqualTo(List.of("test"));
    }


}