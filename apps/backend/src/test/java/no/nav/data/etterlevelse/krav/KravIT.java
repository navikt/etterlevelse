package no.nav.data.etterlevelse.krav;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

public class KravIT extends IntegrationTestBase {

    @Test
    void createKrav() {
        var req = KravRequest.builder()
                .navn("Krav 1")
                .build();
        var resp = restTemplate.postForEntity("/krav", req, KravResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        KravResponse krav = resp.getBody();
        assertThat(krav).isNotNull();

        assertThat(krav.getKravNummer()).isGreaterThanOrEqualTo(101);
        assertThat(krav.getKravVersjon()).isEqualTo(1);
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
