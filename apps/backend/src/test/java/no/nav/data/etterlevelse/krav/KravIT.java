package no.nav.data.etterlevelse.krav;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.common.domain.Periode;
import no.nav.data.etterlevelse.krav.KravController.KravPage;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.Krav.KravStatus;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class KravIT extends IntegrationTestBase {

    @Autowired
    KravService kravService;

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
                .relevansFor(List.of("SAK"))
                .avdeling("AVDELING").underavdeling("UNDERAVDELING")
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
        assertThat(krav.getRelevansFor()).hasSize(1);
        assertThat(krav.getRelevansFor().get(0).getCode()).isEqualTo("SAK");
        assertThat(krav.getAvdeling().getCode()).isEqualTo("AVDELING");
        assertThat(krav.getUnderavdeling().getCode()).isEqualTo("UNDERAVDELING");
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

    @Test
    void uploadImages() {
        var krav = storageService.save(Krav.builder().navn("Krav 1").build());

        var headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        var body = new LinkedMultiValueMap<String, Object>();
        var req = new HttpEntity<>(body, headers);
        byte[] imageOne = {1, 2, 3};
        addImage(body, "image1.png", imageOne);
        addImage(body, "image2.png", new byte[]{4, 5, 6});

        var res = restTemplate.postForEntity("/krav/{id}/files", req, String[].class, krav.getId());
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody()).hasSize(2);
        String id1 = res.getBody()[0];

        var imageRes = restTemplate.getForEntity("/krav/{id}/files/{fileId}", byte[].class, krav.getId(), id1);
        assertThat(imageRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(imageRes.getBody()).isNotNull();
        assertThat(imageRes.getBody()).isEqualTo(imageOne);

        krav.setHensikt(id1);
        storageService.save(krav);

        jdbcTemplate.update("update generic_storage set last_modified_date = now() - interval '15 minute' where type = 'KravImage'");
        assertThat(storageService.getAll(KravImage.class)).hasSize(2);
        kravService.cleanupImages();
        assertThat(storageService.getAll(KravImage.class)).hasSize(1);
    }

    private void addImage(LinkedMultiValueMap<String, Object> body, final String name, byte[] content) {
        var imageHeaders = new LinkedMultiValueMap<String, String>();
        imageHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "form-data; name=file; filename=" + name + ";");
        imageHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE);
        var imageEntity = new HttpEntity<>(content, imageHeaders);

        body.add("file", imageEntity);
    }
}
