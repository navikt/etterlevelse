package no.nav.data.etterlevelse.etterlevelse;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseController.EtterlevelsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
    void createEtterlevelse() {
        var krav = storageService.save(Krav.builder().kravNummer(50).build());
        var req = EtterlevelseRequest.builder()
                .behandling("behandling1")
                .kravNummer(krav.getKravNummer())
                .kravVersjon(krav.getKravVersjon())

                .begrunnelse("begrunnelse")
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

        assertThat(etterlevelse.getBehandling()).isEqualTo("behandling1");
        assertThat(etterlevelse.getKravNummer()).isEqualTo(50);
        assertThat(etterlevelse.getKravVersjon()).isEqualTo(1);

        assertThat(etterlevelse.getBegrunnelse()).isEqualTo("begrunnelse");
        assertThat(etterlevelse.getDokumentasjon()).containsOnly("dok");
        assertThat(etterlevelse.isEtterleves()).isTrue();
        assertThat(etterlevelse.getFristForFerdigstillelse()).isToday();
        assertThat(etterlevelse.getStatus()).isEqualTo(EtterlevelseStatus.UNDER_REDIGERING);
    }

    @Test
    void updateEtterlevelse() {
        var krav = storageService.save(Krav.builder().kravNummer(50).kravVersjon(1).build());
        var etterlevelse = storageService.save(Etterlevelse.builder().behandling("b1").kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon()).build());
        var req = EtterlevelseRequest.builder()
                .behandling("b2")
                .kravNummer(krav.getKravNummer())
                .kravVersjon(krav.getKravVersjon())
                .id(etterlevelse.getId().toString())
                .build();
        var resp = restTemplate.exchange("/etterlevelse/{id}", HttpMethod.PUT, new HttpEntity<>(req), EtterlevelseResponse.class, etterlevelse.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        EtterlevelseResponse etterlevelseResp = resp.getBody();
        assertThat(etterlevelseResp).isNotNull();
        assertThat(etterlevelseResp.getBehandling()).isEqualTo("b2");
    }

    @Test
    void deleteEtterlevelse() {
        var krav = storageService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());
        restTemplate.delete("/etterlevelse/{id}", krav.getId());

        assertThat(storageService.getAll(Etterlevelse.class)).isEmpty();
    }
}
