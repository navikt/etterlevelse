package no.nav.data.etterlevelse.behandlingensLivslop;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopData;
import no.nav.data.etterlevelse.behandlingensLivslop.dto.BehandlingensLivslopRequest;
import no.nav.data.etterlevelse.behandlingensLivslop.dto.BehandlingensLivslopResponse;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class BehandlingensLivslopIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
    }


    @Test
    void getBehandlingensLivslop() {
        var behandlingensLivslop = behandlingensLivslopService.save(generateBehandlingensLivslop(UUID.randomUUID().toString()), false);

        var resp = restTemplate.getForEntity("/behandlingenslivslop/{id}", BehandlingensLivslopResponse.class, behandlingensLivslop.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensLivslopResponse behandlingensLivslopResponse = resp.getBody();
        assertThat(behandlingensLivslopResponse).isNotNull();
    }

    @Test
    void getBehandlingensLivslopByEtterlevelseDokumentasjonId() {
        var behandlingensLivslop = behandlingensLivslopService.save(generateBehandlingensLivslop(UUID.randomUUID().toString()), false);
        behandlingensLivslopService.save(generateBehandlingensLivslop(UUID.randomUUID().toString()), false);

        var resp = restTemplate.getForEntity("/behandlingenslivslop/etterlevelsedokument/{etterlevelseDokumentId}", BehandlingensLivslopResponse.class, behandlingensLivslop.getEtterlevelseDokumentasjonId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensLivslopResponse behandlingensLivslopResponse = resp.getBody();
        assertThat(behandlingensLivslopResponse).isNotNull();
        assertThat(behandlingensLivslopResponse.getEtterlevelseDokumentasjonId()).isEqualTo(behandlingensLivslop.getEtterlevelseDokumentasjonId());
    }

    @Test
    void createBehandlingensLivslop() {

        var request = BehandlingensLivslopRequest.builder()
                .etterlevelseDokumentasjonId(UUID.randomUUID().toString())
                .filer(List.of())
                .beskrivelse("test")
                .build();

        var resp = restTemplate.postForEntity("/behandlingenslivslop",request,  BehandlingensLivslopResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        BehandlingensLivslopResponse behandlingensLivslopResponse = resp.getBody();
        assertThat(behandlingensLivslopResponse).isNotNull();
        assertThat(behandlingensLivslopResponse.getEtterlevelseDokumentasjonId()).isEqualTo(request.getEtterlevelseDokumentasjonId());
    }

    @Test
    void updateBehandlingensLivslop() {
        var behandlingensLivslop = behandlingensLivslopService.save(generateBehandlingensLivslop(UUID.randomUUID().toString()), false);

        var request = BehandlingensLivslopRequest.builder()
                .id(behandlingensLivslop.getId().toString())
                .etterlevelseDokumentasjonId(behandlingensLivslop.getEtterlevelseDokumentasjonId())
                .filer(List.of())
                .beskrivelse("test updated")
                .build();

        var resp = restTemplate.exchange("/behandlingenslivslop/{id}", HttpMethod.PUT, new HttpEntity<>(request), BehandlingensLivslopResponse.class, request.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensLivslopResponse behandlingensLivslopResponse = resp.getBody();
        assertThat(behandlingensLivslopResponse).isNotNull();
        assertThat(behandlingensLivslopResponse.getEtterlevelseDokumentasjonId()).isEqualTo(request.getEtterlevelseDokumentasjonId());
        assertThat(behandlingensLivslopResponse.getBeskrivelse()).isEqualTo("test updated");
    }

    @Test
    void deleteBehandlingensLivslop() {
        var behandlingensLivslop = behandlingensLivslopService.save(generateBehandlingensLivslop(UUID.randomUUID().toString()), false);
        restTemplate.delete("/behandlingenslivslop/{id}", behandlingensLivslop.getId());

        assertThat(behandlingensLivslopRepo.count()).isEqualTo(0);
    }

    public BehandlingensLivslop generateBehandlingensLivslop(String etterlevelseDokumentasjonId) {
        return BehandlingensLivslop.builder()
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .behandlingensLivslopData(
                        BehandlingensLivslopData.builder()
                                .filer(List.of())
                                .build()
                )
                .build();
    }
}
