package no.nav.data.integration.p360;

import com.github.tomakehurst.wiremock.client.WireMock;
import no.nav.data.integration.p360.dto.P360Case;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static no.nav.data.common.utils.JsonUtils.toJson;

public class P360Mocks {
    public static void mock() {
        WireMock.stubFor(post("/oauth2/token")
                .willReturn(okJson("""
        {"access_token":"test-token","token_type":"Bearer","expires_in":3600}
    """)));
        WireMock.stubFor(post("/p360/CaseService/CreateCase").willReturn(okJson(toJson(p360Case()))));
    }

    private static P360Case p360Case() {
        return P360Case.builder().Recno(12345).CaseNumber("CASETEST").Title("CASETEST").Successful(true).ErrorMessage("").ErrorDetails("").build();
    }
}
