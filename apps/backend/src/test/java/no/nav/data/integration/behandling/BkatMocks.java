package no.nav.data.integration.behandling;

import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.integration.behandling.dto.BkatAffiliation;
import no.nav.data.integration.behandling.dto.BkatCode;
import no.nav.data.integration.behandling.dto.BkatProcess;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static no.nav.data.common.utils.JsonUtils.toJson;

public class BkatMocks {

    public static void mock() {
        stubFor(get("/bkat/process/74288ec1-c45d-4b9f-b799-33539981a690").willReturn(okJson(toJson(processMockResponse()))));
        stubFor(get("/bkat/process?pageNumber=0&pageSize=20").willReturn(okJson(toJson(new RestResponsePage<>(List.of(processMockResponse()))))));
        stubFor(post("/bkat/process/shortbyid").willReturn(okJson(toJson(new RestResponsePage<>(List.of(processMockResponse()))))));
        stubFor(get("/bkat/process/search/name?includePurpose=true").willReturn(okJson(toJson(new RestResponsePage<>(List.of(processMockResponse()))))));
    }

    public static BkatProcess processMockResponse() {
        return processMockResponse("74288ec1-c45d-4b9f-b799-33539981a690", 101);
    }

    public static BkatProcess stubProcess(String id, int num) {
        var resp = processMockResponse(id, num);
        stubFor(get("/bkat/process/%s".formatted(id)).willReturn(okJson(toJson(resp))));
        return resp;
    }

    private static BkatProcess processMockResponse(String id, int num) {
        return BkatProcess.builder()
                .id(id)
                .name("process name")
                .number(num)
                .description("formaal")
                .purpose(BkatCode.builder().list("FORMAAL").code("FOR").shortName("For").description("desc").build())
                .affiliation(BkatAffiliation.builder()
                        .department(BkatCode.builder().list("AVDELING").code("AVD").shortName("Avd").description("desc").build())
                        .subDepartment(BkatCode.builder().list("LINJE").code("LIN").shortName("Lin").description("desc").build())
                        .product(BkatCode.builder().list("SYSTEM").code("SYS").shortName("Sys").description("desc").build())
                        .productTeam("team")
                        .build())
                .build();
    }
}
