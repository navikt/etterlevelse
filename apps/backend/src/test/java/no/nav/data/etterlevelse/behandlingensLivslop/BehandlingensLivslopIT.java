package no.nav.data.etterlevelse.behandlingensLivslop;

import lombok.SneakyThrows;
import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopData;
import no.nav.data.etterlevelse.behandlingensLivslop.dto.BehandlingensLivslopRequest;
import no.nav.data.etterlevelse.behandlingensLivslop.dto.BehandlingensLivslopResponse;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;

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
        var behandlingensLivslop = createBehandlingensLivslop();

        var resp = restTemplate.getForEntity("/behandlingenslivslop/{id}", BehandlingensLivslopResponse.class, behandlingensLivslop.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensLivslopResponse behandlingensLivslopResponse = resp.getBody();
        assertThat(behandlingensLivslopResponse.getEtterlevelseDokumentasjonId()).isEqualTo(behandlingensLivslop.getEtterlevelseDokumentasjonId());
    }

    @Test
    void getBehandlingensLivslopByEtterlevelseDokumentasjonId() {
        var behandlingensLivslop = createBehandlingensLivslop();
        
        var resp = restTemplate.getForEntity("/behandlingenslivslop/etterlevelsedokument/{etterlevelseDokumentId}", BehandlingensLivslopResponse.class, behandlingensLivslop.getEtterlevelseDokumentasjonId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensLivslopResponse behandlingensLivslopResponse = resp.getBody();
        assertThat(behandlingensLivslopResponse).isNotNull();
        assertThat(behandlingensLivslopResponse.getEtterlevelseDokumentasjonId()).isEqualTo(behandlingensLivslop.getEtterlevelseDokumentasjonId());
    }

    @SneakyThrows
    @Test
    void testCreateBehandlingensLivslop() {
        UUID edokId = createEtterlevelseDokumentasjon().getId();

        var requestBody = BehandlingensLivslopRequest.builder()
                .etterlevelseDokumentasjonId(edokId)
                .filer(List.of())
                .beskrivelse("test")
                .build();
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        var body = new LinkedMultiValueMap<String, Object>();
        var request = new HttpEntity<>(body, headers);
        byte[] image = new ClassPathResource("img.png").getInputStream().readAllBytes();
        body.add("request", requestBody);
        addImage(body, "image1.png", image);
        addImage(body, "image2.png", image);
        var resp = restTemplate.postForEntity("/behandlingenslivslop", request,  BehandlingensLivslopResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        BehandlingensLivslopResponse behandlingensLivslopResponse = resp.getBody();
        assertThat(behandlingensLivslopResponse).isNotNull();
        assertThat(behandlingensLivslopResponse.getEtterlevelseDokumentasjonId()).isEqualTo(requestBody.getEtterlevelseDokumentasjonId());
        assertThat(behandlingensLivslopRepo.count()).isOne();
    }

    @SneakyThrows
    @Test
    void updateBehandlingensLivslop() {
        var behandlingensLivslop = createBehandlingensLivslop();

        var requestBody = BehandlingensLivslopRequest.builder()
                .id(behandlingensLivslop.getId())
                .etterlevelseDokumentasjonId(behandlingensLivslop.getEtterlevelseDokumentasjonId())
                .filer(List.of())
                .beskrivelse("test updated")
                .build();
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        var body = new LinkedMultiValueMap<String, Object>();
        var request = new HttpEntity<>(body, headers);
        byte[] image = new ClassPathResource("img.png").getInputStream().readAllBytes();
        body.add("id", requestBody.getId());
        body.add("request", requestBody);
        addImage(body, "image1.png", image);
        addImage(body, "image2.png", image);
        var resp = restTemplate.exchange("/behandlingenslivslop/{id}", HttpMethod.PUT, request, BehandlingensLivslopResponse.class, requestBody.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        BehandlingensLivslopResponse behandlingensLivslopResponse = resp.getBody();
        assertThat(behandlingensLivslopResponse).isNotNull();
        assertThat(behandlingensLivslopResponse.getEtterlevelseDokumentasjonId()).isEqualTo(requestBody.getEtterlevelseDokumentasjonId());
        assertThat(behandlingensLivslopResponse.getBeskrivelse()).isEqualTo("test updated");
    }

    @Test
    void deleteBehandlingensLivslop() {
        var behandlingensLivslop = createBehandlingensLivslop();

        restTemplate.delete("/behandlingenslivslop/{id}", behandlingensLivslop.getId());

        assertThat(behandlingensLivslopRepo.count()).isZero();
    }

    public BehandlingensLivslop createBehandlingensLivslop() {
        UUID edokId = createEtterlevelseDokumentasjon().getId();
        var bl = BehandlingensLivslop.builder()
                .etterlevelseDokumentasjonId(edokId)
                .behandlingensLivslopData(BehandlingensLivslopData.builder().filer(List.of()).build())
                .build();
        return behandlingensLivslopService.save(bl, false);        
    }

    private void addImage(LinkedMultiValueMap<String, Object> body, final String name, byte[] content) {
        var imageHeaders = new LinkedMultiValueMap<String, String>();
        imageHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "form-data; name=filer; filename=" + name + ";");
        imageHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE);
        var imageEntity = new HttpEntity<>(content, imageHeaders);

        body.add("filer", imageEntity);
    }
}
