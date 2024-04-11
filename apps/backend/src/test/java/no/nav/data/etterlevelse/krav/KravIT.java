package no.nav.data.etterlevelse.krav;

import lombok.SneakyThrows;
import no.nav.data.IntegrationTestBase;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.krav.KravController.KravPage;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import no.nav.data.etterlevelse.krav.dto.RegelverkRequest;
import no.nav.data.etterlevelse.krav.dto.RegelverkResponse;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieRequest;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieResponse;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class KravIT extends IntegrationTestBase {

    @Autowired
    KravService kravService;

    @BeforeEach
    void setUp() {
        CodelistStub.initializeCodelist();
        MockFilter.setUser(MockFilter.KRAVEIER);
    }

    @Test
    void getKrav() {
        var krav = kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).build());

        var resp = restTemplate.getForEntity("/krav/{id}", KravResponse.class, krav.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        KravResponse kravResp = resp.getBody();
        assertThat(kravResp).isNotNull();
    }

    @Test
    void getKravByNummer() {
        var krav = kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).build());

        var resp = restTemplate.getForEntity("/krav/kravnummer/{nummer}/{versjon}", KravResponse.class, krav.getKravNummer(), krav.getKravVersjon());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        KravResponse kravResp = resp.getBody();
        assertThat(kravResp).isNotNull();
    }

    @Test
    void getAllKrav() {
        kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).build());
        kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).kravVersjon(2).build());

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
        var req = getKravRequest();

        var resp = restTemplate.postForEntity("/krav", req, KravResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        KravResponse krav = resp.getBody();
        assertThat(krav).isNotNull();

        assertThat(krav.getId()).isNotNull();
        assertThat(krav.getKravNummer()).isGreaterThanOrEqualTo(101);
        assertThat(krav.getKravVersjon()).isEqualTo(1);

        assertFields(krav);
    }

    @Test
    void getKravEtterlever() {
        var kravResp = restTemplate.postForEntity("/krav", getKravRequest(), KravResponse.class);
        MockFilter.clearUser();
        var resp = restTemplate.getForEntity("/krav/{id}", KravResponse.class, kravResp.getBody().getId());

        assertThat(resp.getBody().getChangeStamp().getLastModifiedBy()).isEqualTo("Skjult");
        assertThat(resp.getBody().getVarslingsadresser()).isEmpty();
    }

    private KravRequest getKravRequest() {
        return KravRequest.builder()
                .navn("Krav 1")
                .beskrivelse("beskrivelse")
                .utdypendeBeskrivelse("utbesk")
                .versjonEndringer("versjonEndringer")
                .hensikt("hensikt")
                .relevansFor(List.of("SAK"))
                .avdeling("AVDELING").underavdeling("UNDERAVDELING")
                .begrepIder(List.of("TERM-1"))
                .dokumentasjon(List.of("dok"))
                .implementasjoner("impl")
                .varslingsadresser(List.of(new Varslingsadresse("epost@nav.no", AdresseType.EPOST)))
                .rettskilder(List.of("kilde"))
                .tagger(List.of("tag"))
                .regelverk(List.of(RegelverkRequest.builder().lov("ARKIV").spesifisering("§1").build()))
                .status(KravStatus.UTKAST)
                .suksesskriterier(List.of(SuksesskriterieRequest.builder().id(1).navn("suksess").beskrivelse("beskrivelse").build()))
                .build();
    }

    private void assertFields(KravResponse krav) {
        assertThat(krav.getChangeStamp()).isNotNull();
        assertThat(krav.getVersion()).isEqualTo(0);

        assertThat(krav.getNavn()).isEqualTo("Krav 1");
        assertThat(krav.getBeskrivelse()).isEqualTo("beskrivelse");
        assertThat(krav.getUtdypendeBeskrivelse()).isEqualTo("utbesk");
        assertThat(krav.getVersjonEndringer()).isEqualTo("versjonEndringer");
        assertThat(krav.getHensikt()).isEqualTo("hensikt");
        assertThat(krav.getRelevansFor()).hasSize(1);
        assertThat(krav.getRelevansFor().get(0).getCode()).isEqualTo("SAK");
        assertThat(krav.getAvdeling().getCode()).isEqualTo("AVDELING");
        assertThat(krav.getUnderavdeling().getCode()).isEqualTo("UNDERAVDELING");
        assertThat(krav.getBegrepIder()).containsOnly("TERM-1");
        assertThat(krav.getDokumentasjon()).containsOnly("dok");
        assertThat(krav.getImplementasjoner()).isEqualTo("impl");
        assertThat(krav.getVarslingsadresser()).containsOnly(new Varslingsadresse("epost@nav.no", AdresseType.EPOST));
        assertThat(krav.getRettskilder()).containsOnly("kilde");
        assertThat(krav.getTagger()).containsOnly("tag");
        assertThat(krav.getRegelverk()).containsOnly(RegelverkResponse.builder().lov(CodelistService.getCodelistResponse(ListName.LOV, "ARKIV")).spesifisering("§1").build());
        assertThat(krav.getStatus()).isEqualTo(KravStatus.UTKAST);
        assertThat(krav.getSuksesskriterier()).containsOnly(SuksesskriterieResponse.builder().id(1).navn("suksess").beskrivelse("beskrivelse").build());
    }

    @Test
    void createKravVersjon() {
        var kravOne = kravStorageService.save(Krav.builder().kravNummer(50).kravVersjon(2).build());
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
        var krav = kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).kravVersjon(1).build());
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
        var krav = kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).kravVersjon(1).build());
        restTemplate.delete("/krav/{id}", krav.getId());

        assertThat(kravStorageService.getAll(Krav.class)).isEmpty();
    }

    @Test
    void deleteKravWithEtterlevelse() {
        var krav = kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).kravVersjon(1).build());
        etterlevelseStorageService.save(Etterlevelse.builder().kravNummer(50).kravVersjon(1).build());
        restTemplate.delete("/krav/{id}", krav.getId());

        assertThat(kravStorageService.getAll(Krav.class)).isNotEmpty();
    }

    @Test
    void deleteKravWithTilbakemelding() {
        var krav = kravStorageService.save(Krav.builder().navn("Krav 1").kravNummer(50).kravVersjon(1).build());
        tilbakemeldingStorageService.save(Tilbakemelding.builder().meldinger(List.of(Tilbakemelding.Melding.builder().build())).kravNummer(50).kravVersjon(1).build());
        restTemplate.delete("/krav/{id}", krav.getId());

        assertThat(kravStorageService.getAll(Krav.class)).isNotEmpty();
    }

    @SneakyThrows
    @Test
    void uploadImages() {
        var krav = kravStorageService.save(Krav.builder().navn("Krav 1").build());

        var headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        var body = new LinkedMultiValueMap<String, Object>();
        var req = new HttpEntity<>(body, headers);
        byte[] image = new ClassPathResource("img.png").getInputStream().readAllBytes();
        addImage(body, "image1.png", image);
        addImage(body, "image2.png", image);

        var res = restTemplate.postForEntity("/krav/{id}/files", req, String[].class, krav.getId());
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody()).hasSize(2);
        String id1 = res.getBody()[0];
        String id2 = res.getBody()[1];

        var imageRes = restTemplate.getForEntity("/krav/{id}/files/{fileId}", byte[].class, krav.getId(), id1);
        assertThat(imageRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(imageRes.getBody()).isNotNull();
        assertThat(imageRes.getBody()).isEqualTo(image);

        var imageResized = restTemplate.getForEntity("/krav/{id}/files/{fileId}?w=20", byte[].class, krav.getId(), id2);
        assertThat(imageResized.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(imageResized.getBody()).isNotNull();

        krav.setHensikt(id1);
        kravStorageService.save(krav);

        jdbcTemplate.update("update generic_storage set last_modified_date = now() - interval '65 minute' where type = 'KravImage'");
        assertThat(kravImageStorageService.getAll(KravImage.class)).hasSize(2);
        kravService.cleanupImages();
        assertThat(kravImageStorageService.getAll(KravImage.class)).hasSize(1);
    }

    private void addImage(LinkedMultiValueMap<String, Object> body, final String name, byte[] content) {
        var imageHeaders = new LinkedMultiValueMap<String, String>();
        imageHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "form-data; name=file; filename=" + name + ";");
        imageHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE);
        var imageEntity = new HttpEntity<>(content, imageHeaders);

        body.add("file", imageEntity);
    }
}
