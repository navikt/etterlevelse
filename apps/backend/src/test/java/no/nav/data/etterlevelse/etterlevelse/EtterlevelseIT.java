package no.nav.data.etterlevelse.etterlevelse;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseController.EtterlevelsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class EtterlevelseIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void getEtterlevelse() {
        var etterlevelse = storageService.save(Etterlevelse.builder().build());

        var resp = restTemplate.getForEntity("/etterlevelse/{id}", EtterlevelseResponse.class, etterlevelse.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseResponse etterlevelseResp = resp.getBody();
        assertThat(etterlevelseResp).isNotNull();
    }

    @Test
    void getEtterlevelseByNummer() {
        var etterlevelse = storageService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());

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
            storageService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());
            storageService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(2).build());

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
        void getByBehandling() {
            var b1 = storageService.save(Etterlevelse.builder().behandlingId("b1").build());
            storageService.save(Etterlevelse.builder().behandlingId("b2").build());

            var resp = restTemplate.getForEntity("/etterlevelse?behandling={behandling}", EtterlevelsePage.class, "b1");
            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            var body = resp.getBody();
            assertThat(body).isNotNull();
            assertThat(body.getNumberOfElements()).isOne();
            assertThat(body.getContent().get(0).getId()).isEqualTo(b1.getId());
        }
    }

    @Nested
    class Create {

        @Test
        void createEtterlevelse() {
            var krav = storageService.save(Krav.builder().kravNummer(50).status(KravStatus.AKTIV).build());
            var req = EtterlevelseRequest.builder()
                    .behandlingId("behandling1")
                    .kravNummer(krav.getKravNummer())
                    .kravVersjon(krav.getKravVersjon())

                    .statusBegrunnelse("statusBegrunnelse")
                    .dokumentasjon(List.of("dok"))
                    .etterleves(true)
                    .fristForFerdigstillelse(LocalDate.now())
                    .status(EtterlevelseStatus.UNDER_REDIGERING)

                    .build();

            var resp = restTemplate.postForEntity("/etterlevelse", req, EtterlevelseResponse.class);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            var etterlevelse = resp.getBody();
            assertThat(etterlevelse).isNotNull();

            assertThat(etterlevelse.getId()).isNotNull();
            assertFields(etterlevelse);
        }

        private void assertFields(EtterlevelseResponse etterlevelse) {
            assertThat(etterlevelse.getChangeStamp()).isNotNull();
            assertThat(etterlevelse.getVersion()).isEqualTo(0);

            assertThat(etterlevelse.getBehandlingId()).isEqualTo("behandling1");
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
            var req = EtterlevelseRequest.builder()
                    .kravNummer(50)
                    .kravVersjon(1)
                    .build();

            var resp = restTemplate.postForEntity("/etterlevelse", req, String.class);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(resp.getBody()).contains("KravNummer 50 KravVersjon 1 does not exist");
        }

        @ParameterizedTest
        @EnumSource(value = KravStatus.class, names = {"UTKAST", "UTGAATT"})
        void wrongKravStatus(KravStatus status) {
            var krav = storageService.save(Krav.builder().kravNummer(50).status(status).build());
            var req = EtterlevelseRequest.builder()
                    .kravNummer(krav.getKravNummer())
                    .kravVersjon(krav.getKravVersjon())
                    .build();

            var resp = restTemplate.postForEntity("/etterlevelse", req, String.class);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(resp.getBody()).contains("Krav K50.1 kan ikke ettereleves med status");
            assertThat(resp.getBody()).contains(status.name());
        }
    }

    @Test
    void updateEtterlevelse() {
        var krav = storageService.save(Krav.builder().kravNummer(50).kravVersjon(1).status(KravStatus.AKTIV).build());
        var etterlevelse = storageService.save(Etterlevelse.builder().behandlingId("b1").kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon()).build());
        var req = EtterlevelseRequest.builder()
                .behandlingId("b2")
                .kravNummer(krav.getKravNummer())
                .kravVersjon(krav.getKravVersjon())
                .id(etterlevelse.getId().toString())
                .build();
        var resp = restTemplate.exchange("/etterlevelse/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseResponse.class, etterlevelse.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseResponse etterlevelseResp = resp.getBody();
        assertThat(etterlevelseResp).isNotNull();
        assertThat(etterlevelseResp.getBehandlingId()).isEqualTo("b2");
    }

    @Test
    void deleteEtterlevelse() {
        var krav = storageService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());
        restTemplate.delete("/etterlevelse/{id}", krav.getId());

        assertThat(storageService.getAll(Etterlevelse.class)).isEmpty();
    }
}
