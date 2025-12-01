package no.nav.data.pvk.behandlingensArtOgOmfang;

import no.nav.data.IntegrationTestBase;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfang;
import no.nav.data.pvk.behandlingensArtOgOmfang.dto.BehandlingensArtOgOmfangRequest;
import no.nav.data.pvk.behandlingensArtOgOmfang.dto.BehandlingensArtOgOmfangResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class BehandlingensArtOgOmfangIT extends IntegrationTestBase {

    @Test
    void getBehandlingensArtOgOmfang() {
        BehandlingensArtOgOmfang artOgOmfang = createBehandlingensArtOgOmfang();

        var resp = restTemplate.getForEntity("/behandlingens-art-og-omfang/{id}", BehandlingensArtOgOmfangResponse.class, artOgOmfang.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensArtOgOmfangResponse artOgOmfangResponse = resp.getBody();
        assertThat(artOgOmfangResponse.getId()).isEqualTo(artOgOmfang.getId());
    }

    @Test
    void getBehandlingensArtOgOmfangByEtterlevelseDokumentasjonId() {
        BehandlingensArtOgOmfang artOgOmfang = createBehandlingensArtOgOmfang();

        var resp = restTemplate.getForEntity("/behandlingens-art-og-omfang/etterlevelsedokument/{etterlevelseDokumentId}", BehandlingensArtOgOmfangResponse.class, artOgOmfang.getEtterlevelseDokumentasjonId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensArtOgOmfangResponse artOgOmfangResponseResponse = resp.getBody();
        assertThat(artOgOmfangResponseResponse.getId()).isEqualTo(artOgOmfang.getId());
    }

    @Test
    void testCreateBehandlingensArtOgOmfang() {
        UUID ettDokId = createEtterlevelseDokumentasjon().getId();

        BehandlingensArtOgOmfangRequest request = BehandlingensArtOgOmfangRequest.builder()
                .etterlevelseDokumentasjonId(ettDokId)
                .stemmerPersonkategorier(true)
                .personkategoriAntallBeskrivelse("Beskrivelse")
                .build();
        var resp = restTemplate.postForEntity("/behandlingens-art-og-omfang", request, BehandlingensArtOgOmfangResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        BehandlingensArtOgOmfangResponse behandlingensArtOgOmfangResponse = resp.getBody();
        assertThat(behandlingensArtOgOmfangResponse.getEtterlevelseDokumentasjonId()).isEqualTo(request.getEtterlevelseDokumentasjonId());
        assertThat(behandlingensArtOgOmfangRepo.count()).isOne();
    }

    @Test
    void updateBehandlingensArtOgOmfang() {
        BehandlingensArtOgOmfang artOgOmfang = createBehandlingensArtOgOmfang();

        var request = BehandlingensArtOgOmfangRequest.builder()
                .id(artOgOmfang.getId())
                .etterlevelseDokumentasjonId(artOgOmfang.getEtterlevelseDokumentasjonId())
                .stemmerPersonkategorier(false)
                .build();
        var resp = restTemplate.exchange("/behandlingens-art-og-omfang/{id}", HttpMethod.PUT, new HttpEntity<>(request), BehandlingensArtOgOmfangResponse.class, request.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensArtOgOmfangResponse artOgOmfangResponseResponse = resp.getBody();
        assertThat(artOgOmfangResponseResponse.getEtterlevelseDokumentasjonId()).isEqualTo(request.getEtterlevelseDokumentasjonId());
        assertThat(artOgOmfangResponseResponse.getStemmerPersonkategorier()).isEqualTo(false);
        assertThat(behandlingensArtOgOmfangRepo.count()).isOne();
    }

    @Test
    void deleteBehandlingensArtOgOmfang() {
        BehandlingensArtOgOmfang artOgOmfang = createBehandlingensArtOgOmfang();

        restTemplate.delete("/behandlingens-art-og-omfang/{id}", artOgOmfang.getId());

        assertThat(behandlingensArtOgOmfangRepo.count()).isEqualTo(0);
    }
}
