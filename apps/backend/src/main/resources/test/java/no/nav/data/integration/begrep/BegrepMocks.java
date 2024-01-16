package no.nav.data.integration.begrep;

import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.integration.begrep.dto.PollyTerm;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static no.nav.data.common.utils.JsonUtils.toJson;

public class BegrepMocks {

    public static void mock() {
        stubFor(get("/bkat/term/TERM-1").willReturn(okJson(toJson(createTerm()))));
        stubFor(get("/bkat/term/search/term").willReturn(okJson(toJson(new RestResponsePage<>(List.of(createTerm()))))));
    }

    private static PollyTerm createTerm() {
        return PollyTerm.builder()
                .id("TERM-1")
                .description("Term 1")
                .name("Term 1 Name")
                .build();
    }
}
