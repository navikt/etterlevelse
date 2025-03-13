package no.nav.data.pvk.pvotilbakemelding;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemedlingRequest;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemeldingResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class PvoTilbakemeldingIT  extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }

    @Test
    void getPvoTilbakemelding() {
        var pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);
        var pvoTilbakemelding = pvoTilbakemeldingService.save(generatePvoTilbakemelding(pvkDokument.getId()), false);

        var resp = restTemplate.getForEntity("/pvotilbakemelding/{id}", PvoTilbakemeldingResponse.class, pvoTilbakemelding.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        PvoTilbakemeldingResponse pvoTilbakemeldingResponse = resp.getBody();
        assertThat(pvoTilbakemeldingResponse).isNotNull();
    }

    @Test
    void getPvoTilbakemeldingByPvkDokumentId() {
        var pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);

        var pvoTilbakemelding = pvoTilbakemeldingService.save(generatePvoTilbakemelding(pvkDokument.getId()), false);

        var resp = restTemplate.getForEntity("/pvotilbakemelding/pvkdokument/{pvkdokumentId}", PvoTilbakemeldingResponse.class, pvoTilbakemelding.getPvkDokumentId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        PvoTilbakemeldingResponse pvoTilbakemeldingResponse = resp.getBody();
        assertThat(pvoTilbakemeldingResponse).isNotNull();
        assertThat(pvoTilbakemeldingResponse.getPvkDokumentId()).isEqualTo(pvoTilbakemelding.getPvkDokumentId().toString());
    }

    @Test
    void createPvoTilbakemelding() {
        var pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);
        var request = PvoTilbakemedlingRequest.builder()
                .pvkDokumentId(pvkDokument.getId().toString())
                .status(PvoTilbakemeldingStatus.UNDERARBEID)
                .build();


        var resp = restTemplate.postForEntity("/pvotilbakemelding",request,  PvoTilbakemeldingResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        PvoTilbakemeldingResponse pvoTilbakemeldingResponse = resp.getBody();
        assertThat(pvoTilbakemeldingResponse).isNotNull();
        assertThat(pvoTilbakemeldingResponse.getPvkDokumentId()).isEqualTo(request.getPvkDokumentId());
    }

    @Test
    void updatePvoTilbakemelding() {
        var pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);
        var pvoTilbakemelding = pvoTilbakemeldingService.save(generatePvoTilbakemelding(pvkDokument.getId()), false);

        var request = PvoTilbakemedlingRequest.builder()
                .id(pvoTilbakemelding.getId().toString())
                .pvkDokumentId(pvkDokument.getId().toString())
                .status(PvoTilbakemeldingStatus.FERDIG)
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
        var pvkDokument = pvkDokumentService.save(generatePvkDokument(UUID.randomUUID()), false);
        var pvoTilbakemelding = pvoTilbakemeldingService.save(generatePvoTilbakemelding(pvkDokument.getId()), false);
        restTemplate.delete("/pvotilbakemelding/{id}", pvoTilbakemelding.getId());

        assertThat(pvoTilbakemeldingRepo.count()).isEqualTo(0);
    }
}
