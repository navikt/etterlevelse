package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.IntegrationTestBase;
import no.nav.data.TestConfig;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonData;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
public class EtterlevelseDokumentasjonIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void getEtterlevelseDokumentasjon() {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.save(EtterlevelseDokumentasjon.builder()
                .etterlevelseDokumentasjonData(EtterlevelseDokumentasjonData.builder().title("test").build()).build());

        var resp = restTemplate.getForEntity("/etterlevelsedokumentasjon/{id}", EtterlevelseDokumentasjonResponse.class, etterlevelseDokumentasjon.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponseResp = resp.getBody();
        assertThat(etterlevelseDokumentasjonResponseResp).isNotNull();
        assertThat(etterlevelseDokumentasjonResponseResp.getId()).isEqualTo(etterlevelseDokumentasjon.getId());
    }

    @Test
    void getEtterlevelseByNummer() {
        var etterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.save(EtterlevelseDokumentasjon.builder()
                .etterlevelseDokumentasjonData(EtterlevelseDokumentasjonData.builder().title("test2").etterlevelseNummer(701).build()).build());

        var resp = restTemplate.getForEntity("/etterlevelsedokumentasjon/search/{searchParam}", EtterlevelseDokumentasjonController.EtterlevelseDokumentasjonPage.class, etterlevelseDokumentasjon.getEtterlevelseNummer());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var body = resp.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getNumberOfElements()).isOne();

    }

    @Test
    void deleteEtterlevelseDokumentasjonAndChildren() {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon_1 = etterlevelseDokumentasjonRepo.save(EtterlevelseDokumentasjon.builder()
                .etterlevelseDokumentasjonData(EtterlevelseDokumentasjonData.builder().title("test1").etterlevelseNummer(101).build()).build());
        EtterlevelseDokumentasjon etterlevelseDokumentasjon_2 = etterlevelseDokumentasjonRepo.save(EtterlevelseDokumentasjon.builder()
                .etterlevelseDokumentasjonData(EtterlevelseDokumentasjonData.builder().title("test2").etterlevelseNummer(102).build()).build());


        etterlevelseService.save(Etterlevelse.builder().kravNummer(200).kravVersjon(1).etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId()).build());
        etterlevelseService.save(Etterlevelse.builder().kravNummer(201).kravVersjon(1).etterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId()).build());
        etterlevelseService.save(Etterlevelse.builder().kravNummer(200).kravVersjon(1).etterlevelseDokumentasjonId(etterlevelseDokumentasjon_2.getId()).build());

        createEtterlevelseMetadata(etterlevelseDokumentasjon_1.getId(), 200, 1);
        createEtterlevelseMetadata(etterlevelseDokumentasjon_1.getId(), 201, 1);
        createEtterlevelseMetadata(etterlevelseDokumentasjon_2.getId(), 200, 1);

        restTemplate.delete("/etterlevelsedokumentasjon/{id}", etterlevelseDokumentasjon_1.getId());

        assertThat(etterlevelseDokumentasjonRepo.findAll().size()).isEqualTo(1); // Only etterlevelseDokumentasjon_2 should remain
        assertThat(etterlevelseService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon_1.getId()).size()).isEqualTo(0);
        assertThat(etterlevelseMetadataService.getByEtterlevelseDokumentasjonId(etterlevelseDokumentasjon_1.getId()).size()).isEqualTo(0);
    }

    @Test
    void shouldOnlyUpdatePrioritertKravNummerWithoutOverwrittingOtherFields() {
        var etterlevelseDokumentasjon_1 = etterlevelseDokumentasjonService.save(
                EtterlevelseDokumentasjonRequest.builder()
                        .title("test dokumentasjon")
                        .etterlevelseNummer(101)
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

        var updatedEtterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.save(etterlevelseDokumentasjon_1);

        assertThat(updatedEtterlevelseDokumentasjon.getId()).isEqualTo(etterlevelseDokumentasjon_1.getId());
        assertThat(updatedEtterlevelseDokumentasjon.getTitle()).isEqualTo(etterlevelseDokumentasjon_1.getTitle());
        assertThat(updatedEtterlevelseDokumentasjon.getPrioritertKravNummer()).isEqualTo(List.of("test"));

        log.debug("Updated etterlevelseDokumentasjon: {}", updatedEtterlevelseDokumentasjon.getLastModifiedBy());
    }

    @Test
    void godkjenning_updatesStatusAndVersjonHistorikk() {
        TestConfig.MockFilter.setUser("A123456");
        EtterlevelseDokumentasjon eDok = etterlevelseDokumentasjonRepo.save(
                EtterlevelseDokumentasjon.builder()
                        .etterlevelseDokumentasjonData(
                                EtterlevelseDokumentasjonData.builder()
                                        .title("test")
                                        .status(EtterlevelseDokumentasjonStatus.UNDER_ARBEID)
                                        .etterlevelseDokumentVersjon(1)
                                        .risikoeiere(List.of("A123456"))
                                        .build()
                        )
                        .build()
        );

        EtterlevelseDokumentasjonRequest request = EtterlevelseDokumentasjonRequest.builder()
                .id(eDok.getId())
                .update(true)
                .title(eDok.getTitle())
                .status(EtterlevelseDokumentasjonStatus.UNDER_ARBEID)
                .meldingRisikoeierTilEtterleveler("test")
                .build();

        ResponseEntity<EtterlevelseDokumentasjonResponse> resp = restTemplate.exchange(
                "/etterlevelsedokumentasjon/godkjenning/{id}",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                EtterlevelseDokumentasjonResponse.class,
                eDok.getId()
        );

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        Assertions.assertNotNull(resp.getBody());
        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse = resp.getBody();

        assertThat(etterlevelseDokumentasjonResponse.getId().toString()).isEqualTo(eDok.getId().toString());
        assertThat(etterlevelseDokumentasjonResponse.getStatus()).isEqualTo(EtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER);
        assertThat(etterlevelseDokumentasjonResponse.getVersjonHistorikk().size()).isGreaterThanOrEqualTo(1);

        // persisted state
        EtterlevelseDokumentasjon updated = etterlevelseDokumentasjonRepo.findById(eDok.getId()).orElseThrow();
        assertThat(updated.getEtterlevelseDokumentasjonData().getStatus()).isEqualTo(EtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER);
        assertThat(updated.getEtterlevelseDokumentasjonData().getVersjonHistorikk()).isNotEmpty();
    }

}