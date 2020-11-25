package no.nav.data.etterlevelse.krav;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.common.domain.Periode;
import no.nav.data.etterlevelse.krav.KravController.KravPage;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.Krav.KravStatus;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class KravIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void getKrav() {
        var krav = storageService.save(Krav.builder().navn("Krav 1").kravNummer(50).build());

        var resp = restTemplate.getForEntity("/krav/{id}", KravResponse.class, krav.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        KravResponse kravResp = resp.getBody();
        assertThat(kravResp).isNotNull();
    }

    @Test
    void getKravByNummer() {
        var krav = storageService.save(Krav.builder().navn("Krav 1").kravNummer(50).build());

        var resp = restTemplate.getForEntity("/krav/kravnummer/{nummer}/{versjon}", KravResponse.class, krav.getKravNummer(), krav.getKravVersjon());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        KravResponse kravResp = resp.getBody();
        assertThat(kravResp).isNotNull();
    }

    @Test
    void getAllKrav() {
        storageService.save(Krav.builder().navn("Krav 1").kravNummer(50).build());
        storageService.save(Krav.builder().navn("Krav 1").kravNummer(50).kravVersjon(2).build());

        var resp = restTemplate.getForEntity("/krav?pageSize=1", KravPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        KravPage kravResp = resp.getBody();
        assertThat(kravResp).isNotNull();
        assertThat(kravResp.getNumberOfElements()).isOne();
        assertThat(kravResp.getTotalElements()).isEqualTo(2L);
        assertThat(kravResp.getContent().get(0).getKravVersjon()).isEqualTo(1);

        resp = restTemplate.getForEntity("/krav?pageSize=2&pageNumber=1", KravPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        kravResp = resp.getBody();
        assertThat(kravResp).isNotNull();
        assertThat(kravResp.getNumberOfElements()).isZero();
    }

    @Test
    void createKrav() {
        var req = KravRequest.builder()
                .navn("Krav 1")
                .beskrivelse("beskrivelse")
                .utdypendeBeskrivelse("utbesk")
                .hensikt("hensikt")
                .relevansFor("SAK")
                .avdeling("avd").underavdeling("underavd")
                .begreper(List.of("beg"))
                .dokumentasjon(List.of("dok"))
                .implementasjoner(List.of("impl"))
                .kontaktPersoner(List.of("person"))
                .rettskilder(List.of("kilde"))
                .tagger(List.of("tag"))
                .status(KravStatus.UNDER_REDIGERING)
                .periode(new Periode(LocalDate.now().minusDays(1), LocalDate.now().plusDays(1)))
                .build();

        var resp = restTemplate.postForEntity("/krav", req, KravResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        KravResponse krav = resp.getBody();
        assertThat(krav).isNotNull();

        assertThat(krav.getId()).isNotNull();
        assertThat(krav.getKravNummer()).isGreaterThanOrEqualTo(101);
        assertThat(krav.getKravVersjon()).isEqualTo(1);

        assertFields(krav);
    }

    private void assertFields(KravResponse krav) {
        assertThat(krav.getChangeStamp()).isNotNull();
        assertThat(krav.getVersion()).isEqualTo(0);

        assertThat(krav.getNavn()).isEqualTo("Krav 1");
        assertThat(krav.getBeskrivelse()).isEqualTo("beskrivelse");
        assertThat(krav.getUtdypendeBeskrivelse()).isEqualTo("utbesk");
        assertThat(krav.getHensikt()).isEqualTo("hensikt");
        assertThat(krav.getRelevansFor().getCode()).isEqualTo("SAK");
        assertThat(krav.getAvdeling()).isEqualTo("avd");
        assertThat(krav.getUnderavdeling()).isEqualTo("underavd");
        assertThat(krav.getBegreper()).containsOnly("beg");
        assertThat(krav.getDokumentasjon()).containsOnly("dok");
        assertThat(krav.getImplementasjoner()).containsOnly("impl");
        assertThat(krav.getKontaktPersoner()).containsOnly("person");
        assertThat(krav.getRettskilder()).containsOnly("kilde");
        assertThat(krav.getTagger()).containsOnly("tag");
        assertThat(krav.getStatus()).isEqualTo(KravStatus.UNDER_REDIGERING);
        assertThat(krav.getPeriode()).isEqualTo(new Periode(LocalDate.now().minusDays(1), LocalDate.now().plusDays(1)));
    }

    @Test
    void createKravVersjon() {
        var kravOne = storageService.save(Krav.builder().kravNummer(50).kravVersjon(2).build());
        var req = KravRequest.builder()
                .navn("Krav 2")
                .kravNummer(kravOne.getKravNummer())
                .nyKravVersjon(true)
                .build();
        var resp = restTemplate.postForEntity("/krav", req, KravResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        KravResponse krav = resp.getBody();
        assertThat(krav).isNotNull();

        assertThat(krav.getKravNummer()).isEqualTo(kravOne.getKravNummer());
        assertThat(krav.getKravVersjon()).isEqualTo(kravOne.getKravVersjon() + 1);
    }

    @Test
    void createKravVersjonMustExist() {
        var req = KravRequest.builder()
                .navn("Krav 2")
                .kravNummer(50)
                .nyKravVersjon(true)
                .build();
        var resp = restTemplate.postForEntity("/krav", req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).contains("KravNummer 50 does not exist");
    }

    @Test
    void updateKrav() {
        var krav = storageService.save(Krav.builder().navn("Krav 1").kravNummer(50).kravVersjon(1).build());
        var req = KravRequest.builder()
                .navn("Krav 2")
                .id(krav.getId().toString())
                .build();
        var resp = restTemplate.exchange("/krav/{id}", HttpMethod.PUT, new HttpEntity<>(req), KravResponse.class, krav.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        KravResponse kravResp = resp.getBody();
        assertThat(kravResp).isNotNull();
        assertThat(kravResp.getNavn()).isEqualTo("Krav 2");
    }

    @Test
    void deleteKrav() {
        var krav = storageService.save(Krav.builder().navn("Krav 1").kravNummer(50).kravVersjon(1).build());
        restTemplate.delete("/krav/{id}", krav.getId());

        assertThat(storageService.getAll(Krav.class)).isEmpty();
    }
}
