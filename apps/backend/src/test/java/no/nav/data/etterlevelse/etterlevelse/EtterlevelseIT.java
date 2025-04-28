package no.nav.data.etterlevelse.etterlevelse;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseController.EtterlevelsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravData;
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
import java.util.UUID;

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
        var eDok = createEtterlevelseDokumentasjon();
        var etterlevelse = etterlevelseService.save(Etterlevelse.builder().kravVersjon(1).kravNummer(200).etterlevelseDokumentasjonId(eDok.getId()).build());

        var resp = restTemplate.getForEntity("/etterlevelse/{id}", EtterlevelseResponse.class, etterlevelse.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseResponse etterlevelseResp = resp.getBody();
        assertThat(etterlevelseResp).isNotNull();
    }

    @Test
    void getEtterlevelseByNummer() {
        var eDok = createEtterlevelseDokumentasjon();
        var etterlevelse = etterlevelseService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).etterlevelseDokumentasjonId(eDok.getId()).build());

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

    @Test
    void deleteEtterlevelse() {
        var eDok = createEtterlevelseDokumentasjon();
        var etterlevelse = etterlevelseService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).etterlevelseDokumentasjonId(eDok.getId()).build());
        restTemplate.delete("/etterlevelse/{id}", etterlevelse.getId());

        assertThat(etterlevelseRepo.count()).isEqualTo(0);
    }

    @Test
    void updateEtterlevelse() {
        var krav = createKrav();
        var eDok1 = createEtterlevelseDokumentasjon();
        var eDok2 = createEtterlevelseDokumentasjon();
        var etterlevelse = etterlevelseService.save(Etterlevelse.builder().etterlevelseDokumentasjonId(eDok1.getId()).kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon()).build());
        var req = EtterlevelseRequest.builder()
                .etterlevelseDokumentasjonId(eDok2.getId())
                .kravNummer(krav.getKravNummer())
                .kravVersjon(krav.getKravVersjon())
                .id(etterlevelse.getId())
                .prioritised(false)
                .build();
        var resp = restTemplate.exchange("/etterlevelse/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseResponse.class, etterlevelse.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseResponse etterlevelseResp = resp.getBody();
        assertThat(etterlevelseResp).isNotNull();
        assertThat(etterlevelseResp.getEtterlevelseDokumentasjonId()).isEqualTo(eDok2.getId());
    }

    @Test
    void deleteKravOnEtterlevelseEndpoint() {
        var eDok = createEtterlevelseDokumentasjon();
        etterlevelseService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).etterlevelseDokumentasjonId(eDok.getId()).build());

        var krav = createKrav();

        restTemplate.delete("/etterlevelse/{id}", krav.getId());

        var resp = restTemplate.getForEntity("/krav/{id}", KravResponse.class, krav.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        KravResponse kravResp = resp.getBody();
        assertThat(kravResp.getKravNummer()).isEqualTo(50);
    }

    @Nested
    class GetAll {

        @Test
        void getAllEtterlevelse() {
            var eDok1 = createEtterlevelseDokumentasjon();
            var eDok2 = createEtterlevelseDokumentasjon();
            etterlevelseService.save(Etterlevelse.builder().etterlevelseDokumentasjonId(eDok1.getId()).kravNummer(50).kravVersjon(1).build());
            etterlevelseService.save(Etterlevelse.builder().etterlevelseDokumentasjonId(eDok2.getId()).kravNummer(50).kravVersjon(2).build());

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
        void getEtterlevelseByEtterlevelseDokumentasjonIdAndKravId_fetchEtterlevelseWithEtterlevelseDokumentasjonIdAndKravNummer_OneEtterlevelse() {
            var eDok1 = createEtterlevelseDokumentasjon();
            var eDok2 = createEtterlevelseDokumentasjon();

            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId(eDok1.getId())
                    .kravNummer(50)
                    .kravVersjon(1)
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId(eDok2.getId())
                    .kravNummer(50)
                    .kravVersjon(2)
                    .build());
            var resp = restTemplate.getForEntity("/etterlevelse/etterlevelseDokumentasjon/{id}/50", EtterlevelsePage.class, eDok1.getId());
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(resp.getBody()).isNotNull();
            assertThat(resp.getBody().getNumberOfElements()).isOne();
            assertThat(resp.getBody().getTotalElements()).isEqualTo(1L);
        }

        @Test
        void getEtterlevelseByEtterlevelseDokumentasjonsIdAndKravId_fetchEtterlevelseWithEtterlevelseDokumentasjonsIdAndKravNummer_TwoEtterlevelse() {
            var eDok1 = createEtterlevelseDokumentasjon();
            var eDok2 = createEtterlevelseDokumentasjon();

            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId(eDok1.getId())
                    .kravNummer(50)
                    .kravVersjon(1)
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId(eDok2.getId())
                    .kravNummer(50)
                    .kravVersjon(2)
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId(eDok1.getId())
                    .kravNummer(50)
                    .kravVersjon(3)
                    .build());
            var resp = restTemplate.getForEntity("/etterlevelse/etterlevelseDokumentasjon/{ed1}/50", EtterlevelsePage.class, eDok1.getId());
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(resp.getBody()).isNotNull();
            assertThat(resp.getBody().getTotalElements()).isEqualTo(2L);
        }

        @Test
        void getByEtterlevelseDokumentasjon() {
            var eDok1 = createEtterlevelseDokumentasjon();
            var eDok2 = createEtterlevelseDokumentasjon();

            var ed1 = etterlevelseService.save(Etterlevelse.builder().kravNummer(200).kravVersjon(1).etterlevelseDokumentasjonId(eDok1.getId()).build());
            etterlevelseService.save(Etterlevelse.builder().kravNummer(200).kravVersjon(1).etterlevelseDokumentasjonId(eDok2.getId()).build());

            var resp = restTemplate.getForEntity("/etterlevelse?etterlevelseDokumentasjon={etterlevelseDokumentasjon}", EtterlevelsePage.class, eDok1.getId());
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            var body = resp.getBody();
            assertThat(body).isNotNull();
            assertThat(body.getNumberOfElements()).isOne();
            assertThat(body.getContent().get(0).getId()).isEqualTo(ed1.getId());
        }
    }

    @Nested
    class Create {

        @Test
        void createEtterlevelse() {
            var krav = createKrav();
            var eDok = createEtterlevelseDokumentasjon();
            var req = EtterlevelseRequest.builder()
                    .kravNummer(krav.getKravNummer())
                    .kravVersjon(krav.getKravVersjon())
                    .etterlevelseDokumentasjonId(eDok.getId())
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
            assertFields(etterlevelse, eDok.getId());
        }

        private void assertFields(EtterlevelseResponse etterlevelse, UUID etterlevelseDokumentasjonId) {
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
                    .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId())
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
            var krav = kravService.save(Krav.builder().id(UUID.randomUUID()).kravNummer(50).data(KravData.builder().status(status).build()).build());
            var req = EtterlevelseRequest.builder()
                    .kravNummer(krav.getKravNummer())
                    .kravVersjon(krav.getKravVersjon())
                    .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId())
                    .prioritised(false)
                    .build();

            var resp = restTemplate.postForEntity("/etterlevelse", req, String.class);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(resp.getBody()).contains("Krav K50.1 kan ikke ettereleves med status");
            assertThat(resp.getBody()).contains(status.name());
        }
    }
}
