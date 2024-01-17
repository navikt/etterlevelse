package no.nav.data.etterlevelse.krav;

import no.nav.data.IntegrationTestBase;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding.Rolle;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding.TilbakemeldingsType;
import no.nav.data.etterlevelse.krav.dto.CreateTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingNewMeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.slack.dto.SlackDtos.PostMessageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;
import static no.nav.data.TestConfig.MockFilter.KRAVEIER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class TilbakemeldingIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        PostMessageResponse slackResponse = new PostMessageResponse();
        slackResponse.setOk(true);
        stubFor(post("/slack/chat.postMessage").willReturn(okJson(JsonUtils.toJson(slackResponse))));
    }

    @Test
    void tilbakemelding() {
        Krav krav = createKrav();
        var tilbakemeldingId = testCreate(krav.getKravNummer(), krav.getKravVersjon());
        testNewMelding(tilbakemeldingId);
    }

    @Test
    void getForKrav() {
        MockFilter.setUser("A123456");
        Krav krav = createKrav();
        var req = createCreateTilbakemeldingRequest(krav.getKravNummer(), krav.getKravVersjon());
        restTemplate.postForEntity("/tilbakemelding", req, TilbakemeldingResponse.class);

        var resp = restTemplate.getForEntity("/tilbakemelding/{kravNummer}/{kravVersjon}", TilbakemeldingController.TilbakemeldingPage.class, krav.getKravNummer(), krav.getKravVersjon());

        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getContent()).hasSize(1);
    }

    private UUID testCreate(Integer kravNummer, Integer kravVersjon) {
        var req = createCreateTilbakemeldingRequest(kravNummer, kravVersjon);

        MockFilter.setUser("A123456");
        var resp = restTemplate.postForEntity("/tilbakemelding", req, TilbakemeldingResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getKravNummer()).isEqualTo(kravNummer);
        assertThat(resp.getBody().getKravVersjon()).isEqualTo(kravVersjon);

        verify(postRequestedFor(urlEqualTo("/slack/chat.postMessage"))
                .withRequestBody(matchingJsonPath("$.channel", equalTo("xyz")))
        );

        UUID tilbakemeldingId = resp.getBody().getId();
        Tilbakemelding tilbakemelding = tilbakemeldingStorageService.get(tilbakemeldingId);
        assertThat(tilbakemelding.getMelder().getIdent()).isEqualTo("A123456");
        assertThat(tilbakemelding.getMeldinger()).hasSize(1);
        assertThat(tilbakemelding.getLastMelding().getMeldingNr()).isOne();

        return tilbakemeldingId;
    }

    private void testNewMelding(UUID tilbakemeldingId) {
        MockFilter.setUser(KRAVEIER);
        var meldingReq = TilbakemeldingNewMeldingRequest.builder()
                .tilbakemeldingId(tilbakemeldingId)
                .melding("takk")
                .rolle(Rolle.KRAVEIER)
                .build();
        var resp = restTemplate.postForEntity("/tilbakemelding/melding", meldingReq, TilbakemeldingResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertTilbakemelding(resp.getBody());

        verify(postRequestedFor(urlEqualTo("/slack/chat.postMessage"))
                .withRequestBody(matchingJsonPath("$.channel", equalTo("user1Channel")))
        );

        Tilbakemelding tilbakemelding = tilbakemeldingStorageService.get(tilbakemeldingId);
        assertThat(tilbakemelding.getMeldinger()).hasSize(2);
        assertThat(tilbakemelding.getLastMelding().getMeldingNr()).isEqualTo(2);
    }

    private void assertTilbakemelding(TilbakemeldingResponse tilbakemelding) {
        assertThat(tilbakemelding.getTittel()).isEqualTo("Nice");
        assertThat(tilbakemelding.getType()).isEqualTo(TilbakemeldingsType.GOD);
        assertThat(tilbakemelding.getMelderIdent()).isEqualTo("A123456");
        assertThat(tilbakemelding.getMeldinger()).hasSize(2);

        assertThat(tilbakemelding.getMeldinger().get(0).getMeldingNr()).isEqualTo(1);
        assertThat(tilbakemelding.getMeldinger().get(0).getFraIdent()).isEqualTo("A123456");
        assertThat(tilbakemelding.getMeldinger().get(0).getRolle()).isEqualTo(Rolle.MELDER);
        assertThat(tilbakemelding.getMeldinger().get(0).getTid()).isCloseTo(LocalDateTime.now(), within(1, ChronoUnit.SECONDS));
        assertThat(tilbakemelding.getMeldinger().get(0).getInnhold()).isEqualTo("nice krav");

        assertThat(tilbakemelding.getMeldinger().get(1).getMeldingNr()).isEqualTo(2);
        assertThat(tilbakemelding.getMeldinger().get(1).getFraIdent()).isEqualTo("A123457");
        assertThat(tilbakemelding.getMeldinger().get(1).getRolle()).isEqualTo(Rolle.KRAVEIER);
        assertThat(tilbakemelding.getMeldinger().get(1).getTid()).isCloseTo(LocalDateTime.now(), within(1, ChronoUnit.SECONDS));
        assertThat(tilbakemelding.getMeldinger().get(1).getInnhold()).isEqualTo("takk");
    }

    private CreateTilbakemeldingRequest createCreateTilbakemeldingRequest(Integer kravNummer, Integer kravVersjon) {
        return CreateTilbakemeldingRequest.builder()
                .kravNummer(kravNummer).kravVersjon(kravVersjon)
                .type(TilbakemeldingsType.GOD)
                .varslingsadresse(Varslingsadresse.builder().type(AdresseType.SLACK_USER).adresse("user1").build())
                .tittel("Nice")
                .foersteMelding("nice krav")
                .build();
    }

    private Krav createKrav() {
        return kravStorageService.save(Krav.builder()
                .kravNummer(50)
                .varslingsadresser(List.of(Varslingsadresse.builder()
                        .type(AdresseType.SLACK)
                        .adresse("xyz")
                        .build()))
                .build());
    }
}