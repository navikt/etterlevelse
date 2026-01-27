package no.nav.data.pvk.pvkdokument;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentRequest;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class PvkDokumentIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void getPvkDokument() {
        PvkDokument pvkDokument = createPvkDokument();

        var resp = restTemplate.getForEntity("/pvkdokument/{id}", PvkDokumentResponse.class, pvkDokument.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        PvkDokumentResponse pvkDokumentResponse = resp.getBody();
        assertThat(pvkDokumentResponse.getId()).isEqualTo(pvkDokument.getId());
    }

    @Test
    void getPvkDokumentByEtterlevelseDokumentasjonId() {
        PvkDokument pvkDokument = createPvkDokument();

        var resp = restTemplate.getForEntity("/pvkdokument/etterlevelsedokument/{etterlevelseDokumentId}", PvkDokumentResponse.class, pvkDokument.getEtterlevelseDokumentId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        PvkDokumentResponse pvkDokumentResponse = resp.getBody();
        assertThat(pvkDokumentResponse.getId()).isEqualTo(pvkDokument.getId());
    }

    @Test
    void testCreatePvkDokument() {
        UUID ettDokId = createEtterlevelseDokumentasjon().getId();

        PvkDokumentRequest request = PvkDokumentRequest.builder()
                .etterlevelseDokumentId(ettDokId)
                .status(PvkDokumentStatus.UNDERARBEID)
                .ytterligereEgenskaper(List.of())
                .build();
        var resp = restTemplate.postForEntity("/pvkdokument",request,  PvkDokumentResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        PvkDokumentResponse pvkDokumentResponse = resp.getBody();
        assertThat(pvkDokumentResponse.getEtterlevelseDokumentId()).isEqualTo(request.getEtterlevelseDokumentId());
        assertThat(pvkDokumentRepo.count()).isOne();
    }

    @Test
    void updatePvkDokument() {
        PvkDokument pvkDokument = createPvkDokument();

        var request = PvkDokumentRequest.builder()
                .id(pvkDokument.getId())
                .etterlevelseDokumentId(pvkDokument.getEtterlevelseDokumentId())
                .status(PvkDokumentStatus.UNDERARBEID)
                .ytterligereEgenskaper(List.of("PROFILERING", "TEKNOLOGI"))
                .build();
        var resp = restTemplate.exchange("/pvkdokument/{id}", HttpMethod.PUT, new HttpEntity<>(request), PvkDokumentResponse.class, request.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        PvkDokumentResponse pvkDokumentResponse = resp.getBody();
        assertThat(pvkDokumentResponse.getEtterlevelseDokumentId()).isEqualTo(request.getEtterlevelseDokumentId());
        assertThat(pvkDokumentResponse.getYtterligereEgenskaper().size()).isEqualTo(2);
        assertThat(pvkDokumentRepo.count()).isOne();
    }

    @Test
    void deletePvkDokument() {
        PvkDokument pvkDokument = createPvkDokument();

        restTemplate.delete("/pvkdokument/{id}", pvkDokument.getId());

        assertThat(pvkDokumentRepo.count()).isEqualTo(0);
    }

}


