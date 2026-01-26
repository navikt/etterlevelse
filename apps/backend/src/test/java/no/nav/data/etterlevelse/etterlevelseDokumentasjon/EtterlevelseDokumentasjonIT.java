package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.IntegrationTestBase;
import no.nav.data.TestConfig;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonData;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseVersjonHistorikk;
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
                request.getId()
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

    @Test
    void nyVersjon_increasesVersionAndResetsStatus_andPersists() {
        TestConfig.MockFilter.setUser("A123456");

        EtterlevelseDokumentasjon eDok = etterlevelseDokumentasjonRepo.save(
                EtterlevelseDokumentasjon.builder()
                        .etterlevelseDokumentasjonData(
                                EtterlevelseDokumentasjonData.builder()
                                        .title("test")
                                        .status(EtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER)
                                        .etterlevelseDokumentVersjon(1)
                                        .teams(List.of())
                                        .resources(List.of("A123456"))
                                        .risikoeiere(List.of("A123456"))
                                        .versjonHistorikk(List.of(EtterlevelseVersjonHistorikk.builder().versjon(1).build()))
                                        .build()
                        )
                        .build()
        );

        EtterlevelseDokumentasjonRequest request = EtterlevelseDokumentasjonRequest.builder()
                .id(eDok.getId())
                .update(true)
                .title(eDok.getTitle())
                .status(EtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER)
                .etterlevelseDokumentVersjon(1)
                .build();

        ResponseEntity<EtterlevelseDokumentasjonResponse> resp = restTemplate.exchange(
                "/etterlevelsedokumentasjon/ny-versjon/{id}",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                EtterlevelseDokumentasjonResponse.class,
                request.getId()
        );

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        Assertions.assertNotNull(resp.getBody());
        EtterlevelseDokumentasjonResponse body = resp.getBody();

        assertThat(body.getId()).isEqualTo(eDok.getId());
        assertThat(body.getStatus()).isEqualTo(EtterlevelseDokumentasjonStatus.UNDER_ARBEID);
        assertThat(body.getEtterlevelseDokumentVersjon()).isEqualTo(2);
        assertThat(body.getVersjonHistorikk()).isNotEmpty();
        assertThat(body.getVersjonHistorikk().stream().filter(vh -> vh.getVersjon().equals(1)).findFirst())
                .isPresent();
        assertThat(body.getVersjonHistorikk().stream().filter(vh -> vh.getVersjon().equals(1)).findFirst().get().getNyVersjonOpprettetDato()).isNotNull();

        assertThat(body.getVersjonHistorikk().stream().filter(vh -> vh.getVersjon().equals(2)).findFirst())
                .isPresent();

        EtterlevelseDokumentasjon persisted = etterlevelseDokumentasjonRepo.findById(eDok.getId()).orElseThrow();
        assertThat(persisted.getEtterlevelseDokumentasjonData().getStatus()).isEqualTo(EtterlevelseDokumentasjonStatus.UNDER_ARBEID);
        assertThat(persisted.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon()).isEqualTo(2);
        assertThat(persisted.getEtterlevelseDokumentasjonData().getVersjonHistorikk()).isNotEmpty();
        var historikkV2 = persisted.getEtterlevelseDokumentasjonData().getVersjonHistorikk().stream()
                .filter(vh -> vh.getVersjon().equals(1))
                .findFirst()
                .orElseThrow();
        assertThat(historikkV2.getNyVersjonOpprettetDato()).isNotNull();
    }

    @Test
    void nyVersjon_increasesVersionAndResetsStatus_andPersists_wrong_status() {
        TestConfig.MockFilter.setUser("A123456");

        EtterlevelseDokumentasjon eDok = etterlevelseDokumentasjonRepo.save(
                EtterlevelseDokumentasjon.builder()
                        .etterlevelseDokumentasjonData(
                                EtterlevelseDokumentasjonData.builder()
                                        .title("test")
                                        .status(EtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER)
                                        .etterlevelseDokumentVersjon(1)
                                        .teams(List.of())
                                        .resources(List.of("A123456"))
                                        .risikoeiere(List.of("A123456"))
                                        .versjonHistorikk(List.of(EtterlevelseVersjonHistorikk.builder().versjon(1).build()))
                                        .build()
                        )
                        .build()
        );

        EtterlevelseDokumentasjonRequest request = EtterlevelseDokumentasjonRequest.builder()
                .id(eDok.getId())
                .update(true)
                .title(eDok.getTitle())
                .status(EtterlevelseDokumentasjonStatus.UNDER_ARBEID)
                .etterlevelseDokumentVersjon(1)
                .build();

        var resp = restTemplate.exchange(
                "/etterlevelsedokumentasjon/ny-versjon/{id}",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                String.class,
                eDok.getId()
        );

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }


    @Test
    void nyVersjon_increasesVersionAndResetsStatus_andPersists_not_a_member() {
        TestConfig.MockFilter.setUser("A123456");

        EtterlevelseDokumentasjon eDok = etterlevelseDokumentasjonRepo.save(
                EtterlevelseDokumentasjon.builder()
                        .etterlevelseDokumentasjonData(
                                EtterlevelseDokumentasjonData.builder()
                                        .title("test")
                                        .status(EtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER)
                                        .etterlevelseDokumentVersjon(1)
                                        .teams(List.of())
                                        .resources(List.of("B123456"))
                                        .risikoeiere(List.of("B123456"))
                                        .versjonHistorikk(List.of(EtterlevelseVersjonHistorikk.builder().versjon(1).build()))
                                        .build()
                        )
                        .build()
        );

        EtterlevelseDokumentasjonRequest request = EtterlevelseDokumentasjonRequest.builder()
                .id(eDok.getId())
                .update(true)
                .title(eDok.getTitle())
                .status(EtterlevelseDokumentasjonStatus.UNDER_ARBEID)
                .etterlevelseDokumentVersjon(1)
                .build();

        var resp = restTemplate.exchange(
                "/etterlevelsedokumentasjon/ny-versjon/{id}",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                String.class,
                eDok.getId()
        );

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

}