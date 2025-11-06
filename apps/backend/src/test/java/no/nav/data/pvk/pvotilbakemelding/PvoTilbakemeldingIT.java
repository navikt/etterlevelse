package no.nav.data.pvk.pvotilbakemelding;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemedlingRequest;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemeldingResponse;
import no.nav.data.pvk.pvotilbakemelding.dto.VurderingRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class PvoTilbakemeldingIT  extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void getPvoTilbakemelding() {
        PvoTilbakemelding pvoTilbakemelding = createPvoTilbakemelding();

        var resp = restTemplate.getForEntity("/pvotilbakemelding/{id}", PvoTilbakemeldingResponse.class, pvoTilbakemelding.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        PvoTilbakemeldingResponse pvoTilbakemeldingResponse = resp.getBody();
        assertThat(pvoTilbakemeldingResponse).isNotNull();
    }

    @Test
    void getPvoTilbakemeldingByPvkDokumentId() {
        PvoTilbakemelding pvoTilbakemelding = createPvoTilbakemelding();

        var resp = restTemplate.getForEntity("/pvotilbakemelding/pvkdokument/{pvkdokumentId}", PvoTilbakemeldingResponse.class, pvoTilbakemelding.getPvkDokumentId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        PvoTilbakemeldingResponse pvoTilbakemeldingResponse = resp.getBody();
        assertThat(pvoTilbakemeldingResponse).isNotNull();
        assertThat(UUID.fromString(pvoTilbakemeldingResponse.getPvkDokumentId())).isEqualTo(pvoTilbakemelding.getPvkDokumentId());
    }

    @Test
    void testCreatePvoTilbakemelding() {
        UUID pvkDokumentId = createPvkDokument().getId();

        var request = PvoTilbakemedlingRequest.builder()
                .pvkDokumentId(pvkDokumentId.toString())
                .status(PvoTilbakemeldingStatus.UNDERARBEID)
                .vurderinger(List.of(VurderingRequest.builder().innsendingId(1).build()))
                .build();
        var resp = restTemplate.postForEntity("/pvotilbakemelding", request, PvoTilbakemeldingResponse.class);
        
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        PvoTilbakemeldingResponse pvoTilbakemeldingResponse = resp.getBody();
        assertThat(pvoTilbakemeldingResponse).isNotNull();
        assertThat(UUID.fromString(pvoTilbakemeldingResponse.getPvkDokumentId())).isEqualTo(pvkDokumentId);
    }

    @Test
    void updatePvoTilbakemelding() {
        PvoTilbakemelding pvoTilbakemelding = createPvoTilbakemelding();

        var request = PvoTilbakemedlingRequest.builder()
                .id(pvoTilbakemelding.getId())
                .pvkDokumentId(pvoTilbakemelding.getPvkDokumentId().toString())
                .status(PvoTilbakemeldingStatus.FERDIG)
                .vurderinger(List.of(VurderingRequest.builder().innsendingId(1).build()))
                .build();

        var resp = restTemplate.exchange("/pvotilbakemelding/{id}", HttpMethod.PUT, new HttpEntity<>(request), PvoTilbakemeldingResponse.class, request.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        PvoTilbakemeldingResponse pvoTilbakemeldingResponse = resp.getBody();
        assertThat(pvoTilbakemeldingResponse).isNotNull();
        assertThat(pvoTilbakemeldingResponse.getPvkDokumentId()).isEqualTo(request.getPvkDokumentId());
        assertThat(pvoTilbakemeldingResponse.getStatus()).isEqualTo(PvoTilbakemeldingStatus.FERDIG);
    }

    @Test
    void deletePvoTilbakemelding() {
        PvoTilbakemelding pvoTilbakemelding = createPvoTilbakemelding();

        restTemplate.delete("/pvotilbakemelding/{id}", pvoTilbakemelding.getId());

        assertThat(pvoTilbakemeldingRepo.count()).isEqualTo(0);
    }

}
