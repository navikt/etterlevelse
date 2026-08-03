package no.nav.data.pvk.pvkdokument;

import no.nav.data.IntegrationTestBase;
import no.nav.data.TestConfig;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentRequest;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentResponse;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import org.junit.jupiter.api.Assertions;
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
        TestConfig.MockFilter.setUser(TestConfig.MockFilter.BRUKER);
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

    @Test
    void cancelApproval_is_risikoeier_should_succeed() {
        var ettDok = etterlevelseDokumentasjonService.save(
                EtterlevelseDokumentasjonRequest.builder()
                        .title("test dokumentasjon")
                        .etterlevelseNummer(101) // Note: This will be overwritten
                        .beskrivelse("")
                        .forGjenbruk(false)
                        .teams(List.of("TEST"))
                        .resources(List.of("TEST"))
                        .risikoeiere(List.of("U123457"))
                        .irrelevansFor(List.of(""))
                        .update(false)
                        .behandlerPersonopplysninger(true)
                        .behandlingIds(List.of(""))
                        .prioritertKravNummer(List.of())
                        .varslingsadresser(List.of())
                        .build()
        );

        PvkDokument pvkDok = buildPvkDokument();
        pvkDok.setStatus(PvkDokumentStatus.GODKJENT_AV_RISIKOEIER);
        pvkDok.setEtterlevelseDokumentId(ettDok.getId());
        var pvkDokument =  pvkDokumentService.save(pvkDok, false);

        pvoTilbakemeldingRepo.save(PvoTilbakemelding.builder()
                        .pvkDokumentId(pvkDok.getId())
                .build());

        var request = PvkDokumentRequest.builder()
                .id(pvkDokument.getId())
                .etterlevelseDokumentId(pvkDokument.getEtterlevelseDokumentId())
                .status(PvkDokumentStatus.TRENGER_GODKJENNING)
                .ytterligereEgenskaper(List.of("PROFILERING", "TEKNOLOGI"))
                .build();
        var resp = restTemplate.exchange("/pvkdokument/{id}", HttpMethod.PUT, new HttpEntity<>(request), PvkDokumentResponse.class, request.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(pvkDokumentRepo.count()).isOne();
        Assertions.assertNotNull(resp.getBody());
        assertThat(resp.getBody().getStatus()).isEqualTo(PvkDokumentStatus.TRENGER_GODKJENNING);
    }

    @Test
    void cancelApproval_is_not_risikoeier_should_fail() {
        var ettDok = etterlevelseDokumentasjonService.save(
                EtterlevelseDokumentasjonRequest.builder()
                        .title("test dokumentasjon")
                        .etterlevelseNummer(101) // Note: This will be overwritten
                        .beskrivelse("")
                        .forGjenbruk(false)
                        .teams(List.of("TEST"))
                        .resources(List.of("TEST"))
                        .risikoeiere(List.of("U123456"))
                        .irrelevansFor(List.of(""))
                        .update(false)
                        .behandlerPersonopplysninger(true)
                        .behandlingIds(List.of(""))
                        .prioritertKravNummer(List.of())
                        .varslingsadresser(List.of())
                        .build()
        );

        PvkDokument pvkDok = buildPvkDokument();
        pvkDok.setStatus(PvkDokumentStatus.GODKJENT_AV_RISIKOEIER);
        pvkDok.setEtterlevelseDokumentId(ettDok.getId());
        var pvkDokument =  pvkDokumentService.save(pvkDok, false);

        pvoTilbakemeldingRepo.save(PvoTilbakemelding.builder()
                .pvkDokumentId(pvkDok.getId())
                .build());

        var request = PvkDokumentRequest.builder()
                .id(pvkDokument.getId())
                .etterlevelseDokumentId(pvkDokument.getEtterlevelseDokumentId())
                .status(PvkDokumentStatus.TRENGER_GODKJENNING)
                .ytterligereEgenskaper(List.of("PROFILERING", "TEKNOLOGI"))
                .build();
        var resp = restTemplate.exchange("/pvkdokument/{id}", HttpMethod.PUT, new HttpEntity<>(request), String.class, request.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

}


