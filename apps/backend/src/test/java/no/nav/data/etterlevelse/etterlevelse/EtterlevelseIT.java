package no.nav.data.etterlevelse.etterlevelse;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseController.EtterlevelsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class EtterlevelseIT extends IntegrationTestBase {

    @Autowired
    EtterlevelseRepo etterlevelseRepo;
   
    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void getEtterlevelse() {
        var etterlevelse = etterlevelseService.save(Etterlevelse.builder().build());

        var resp = restTemplate.getForEntity("/etterlevelse/{id}", EtterlevelseResponse.class, etterlevelse.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseResponse etterlevelseResp = resp.getBody();
        assertThat(etterlevelseResp).isNotNull();
    }

    @Test
    void getEtterlevelseByNummer() {
        var etterlevelse = etterlevelseService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());

        var resp = restTemplate.getForEntity("/etterlevelse/kravnummer/{nummer}/{versjon}", EtterlevelsePage.class, etterlevelse.getKravNummer(), etterlevelse.getKravVersjon());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        var body = resp.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getNumberOfElements()).isOne();

        resp = restTemplate.getForEntity("/etterlevelse/kravnummer/{nummer}", EtterlevelsePage.class, etterlevelse.getKravNummer());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        body = resp.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getNumberOfElements()).isOne();
    }

    @Nested
    class GetAll {

        @Test
        void getAllEtterlevelse() {
            etterlevelseService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());
            etterlevelseService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(2).build());

            var resp = restTemplate.getForEntity("/etterlevelse?pageSize=1", EtterlevelsePage.class);
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            var body = resp.getBody();
            assertThat(body).isNotNull();
            assertThat(body.getNumberOfElements()).isOne();
            assertThat(body.getTotalElements()).isEqualTo(2L);

            resp = restTemplate.getForEntity("/etterlevelse?pageSize=2&pageNumber=1", EtterlevelsePage.class);
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            body = resp.getBody();
            assertThat(body).isNotNull();
            assertThat(body.getNumberOfElements()).isZero();
        }

        @Test
        void getEtterlevelseByEtterlevelseDokumentasjonIdAndKravId_fetchEtterlevelseWithEtterlevelseDokumentasjonIdAndKravNummer_OneEtterlevelse(){
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId("ed1")
                    .kravNummer(50)
                    .kravVersjon(1)
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId("ed2")
                    .kravNummer(50)
                    .kravVersjon(2)
                    .build());
            var resp = restTemplate.getForEntity("/etterlevelse/etterlevelseDokumentasjon/ed1/50", EtterlevelsePage.class);
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(resp.getBody()).isNotNull();
            assertThat(resp.getBody().getNumberOfElements()).isOne();
            assertThat(resp.getBody().getTotalElements()).isEqualTo(1L);
        }

        @Test
        void getEtterlevelseByEtterlevelseDokumentasjonsIdAndKravId_fetchEtterlevelseWithEtterlevelseDokumentasjonsIdAndKravNummer_TwoEtterlevelse(){
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId("ed1")
                    .kravNummer(50)
                    .kravVersjon(1)
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId("ed2")
                    .kravNummer(50)
                    .kravVersjon(2)
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId("ed1")
                    .kravNummer(50)
                    .kravVersjon(3)
                    .build());
            var resp = restTemplate.getForEntity("/etterlevelse/etterlevelseDokumentasjon/ed1/50", EtterlevelsePage.class);
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(resp.getBody()).isNotNull();
            assertThat(resp.getBody().getTotalElements()).isEqualTo(2L);
        }

        @Test
        void getByEtterlevelseDokumentasjon() {
            var ed1 = etterlevelseService.save(Etterlevelse.builder().etterlevelseDokumentasjonId("ed1").build());
            etterlevelseService.save(Etterlevelse.builder().etterlevelseDokumentasjonId("ed2").build());

            var resp = restTemplate.getForEntity("/etterlevelse?etterlevelseDokumentasjon={etterlevelseDokumentasjon}", EtterlevelsePage.class, "ed1");
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            var body = resp.getBody();
            assertThat(body).isNotNull();
            assertThat(body.getNumberOfElements()).isOne();
            assertThat(body.getContent().get(0).getId()).isEqualTo(ed1.getId());
        }
    }

    @Test
    void updateEtterlevelse() {
        var krav = kravStorageService.save(Krav.builder().kravNummer(50).kravVersjon(1).status(KravStatus.AKTIV).build());
        var etterlevelseDokumentasjon1 = createEtterlevelseDokumentasjon();
        var etterlevelseDokumentasjon2 = createEtterlevelseDokumentasjon();
        var etterlevelse = etterlevelseService.save(Etterlevelse.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjon1.getId().toString()).kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon()).build());
        var req = EtterlevelseRequest.builder()
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjon2.getId().toString())
                .kravNummer(krav.getKravNummer())
                .kravVersjon(krav.getKravVersjon())
                .id(etterlevelse.getId().toString())
                .prioritised(false)
                .build();
        var resp = restTemplate.exchange("/etterlevelse/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseResponse.class, etterlevelse.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseResponse etterlevelseResp = resp.getBody();
        assertThat(etterlevelseResp).isNotNull();
        assertThat(etterlevelseResp.getEtterlevelseDokumentasjonId()).isEqualTo(etterlevelseDokumentasjon2.getId().toString());
    }

    private EtterlevelseDokumentasjon createEtterlevelseDokumentasjon() {
        return etterlevelseDokumentasjonService.save(
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
    }

    @Test
    void deleteEtterlevelse() {
        var krav = etterlevelseService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());
        restTemplate.delete("/etterlevelse/{id}", krav.getId());

        assertThat(etterlevelseRepo.count()).isEqualTo(0);
    }


    @Test
    void deleteKravOnEtterlevelseEndpoint() {
        etterlevelseService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());

        var krav = kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).build());

        restTemplate.delete("/etterlevelse/{id}", krav.getId());


        var resp = restTemplate.getForEntity("/krav/{id}", KravResponse.class, krav.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        KravResponse kravResp = resp.getBody();
        assertThat(kravResp.getKravNummer()).isEqualTo(50);
    }

    @Nested
    class Create {

        @Test
        void createEtterlevelse() {
            var krav = kravStorageService.save(Krav.builder().kravNummer(50).status(KravStatus.AKTIV).build());
            var etterlevelseDokumentasjon = createEtterlevelseDokumentasjon();
            var req = EtterlevelseRequest.builder()
                    .kravNummer(krav.getKravNummer())
                    .kravVersjon(krav.getKravVersjon())
                    .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId().toString())
                    .statusBegrunnelse("statusBegrunnelse")
                    .dokumentasjon(List.of("dok"))
                    .etterleves(true)
                    .prioritised(false)
                    .fristForFerdigstillelse(LocalDate.now())
                    .status(EtterlevelseStatus.UNDER_REDIGERING)

                    .build();

            var resp = restTemplate.postForEntity("/etterlevelse", req, EtterlevelseResponse.class);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            var etterlevelse = resp.getBody();
            assertThat(etterlevelse).isNotNull();

            assertThat(etterlevelse.getId()).isNotNull();
            assertFields(etterlevelse, etterlevelseDokumentasjon.getId().toString());
        }

        private void assertFields(EtterlevelseResponse etterlevelse, String etterlevelseDokumentasjonId) {
            assertThat(etterlevelse.getChangeStamp()).isNotNull();
            assertThat(etterlevelse.getVersion()).isEqualTo(0);

            assertThat(etterlevelse.getEtterlevelseDokumentasjonId()).isEqualTo(etterlevelseDokumentasjonId);

            assertThat(etterlevelse.getKravNummer()).isEqualTo(50);
            assertThat(etterlevelse.getKravVersjon()).isEqualTo(1);

            assertThat(etterlevelse.getStatusBegrunnelse()).isEqualTo("statusBegrunnelse");
            assertThat(etterlevelse.getDokumentasjon()).containsOnly("dok");
            assertThat(etterlevelse.isEtterleves()).isTrue();
            assertThat(etterlevelse.getFristForFerdigstillelse()).isToday();
            assertThat(etterlevelse.getStatus()).isEqualTo(EtterlevelseStatus.UNDER_REDIGERING);
        }

        @Test
        void kravNotFound() {
            var etterlevelseDokumentasjon = createEtterlevelseDokumentasjon();
            var req = EtterlevelseRequest.builder()
                    .kravNummer(50)
                    .kravVersjon(1)
                    .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId().toString())
                    .prioritised(false)
                    .build();

            var resp = restTemplate.postForEntity("/etterlevelse", req, String.class);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(resp.getBody()).contains("KravNummer 50 KravVersjon 1 does not exist");
        }

        @ParameterizedTest
        @EnumSource(value = KravStatus.class, names = {"UTKAST", "UTGAATT"})
        void wrongKravStatus(KravStatus status) {
            var etterlevelseDokumentasjon = createEtterlevelseDokumentasjon();
            var krav = kravStorageService.save(Krav.builder().kravNummer(50).status(status).build());
            var req = EtterlevelseRequest.builder()
                    .kravNummer(krav.getKravNummer())
                    .kravVersjon(krav.getKravVersjon())
                    .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId().toString())
                    .prioritised(false)
                    .build();

            var resp = restTemplate.postForEntity("/etterlevelse", req, String.class);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(resp.getBody()).contains("Krav K50.1 kan ikke ettereleves med status");
            assertThat(resp.getBody()).contains(status.name());
        }
    }
}
