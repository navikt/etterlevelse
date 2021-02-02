package no.nav.data.integration.team;

import com.github.tomakehurst.wiremock.client.WireMock;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.ResourceType;
import no.nav.data.integration.team.teamcat.TeamKatMember;
import no.nav.data.integration.team.teamcat.TeamKatProductArea;
import no.nav.data.integration.team.teamcat.TeamKatTeam;

import java.time.LocalDateTime;
import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.notFound;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static no.nav.data.common.utils.JsonUtils.toJson;

public class TeamcatMocks {

    public static void mock() {
        WireMock.stubFor(get("/teamcat/team").willReturn(okJson(toJson(teamMockResponse()))));
        WireMock.stubFor(get("/teamcat/productarea").willReturn(okJson(toJson(productAreaMockResponse()))));

        WireMock.stubFor(get("/teamcat/resource/search/fam").willReturn(okJson(toJson(new RestResponsePage<>(List.of(resource("A123456"), resource("A123457")))))));
        WireMock.stubFor(get("/teamcat/resource/A123456").willReturn(okJson(toJson(resource("A123456")))));
        WireMock.stubFor(get("/teamcat/resource/A123457").willReturn(okJson(toJson(resource("A123457")))));
        WireMock.stubFor(post("/teamcat/resource/multi").withRequestBody(equalTo(toJson(List.of("A123456", "A123457", "notfound"))))
                .willReturn(okJson(toJson(new RestResponsePage<>(List.of(resource("A123456"), resource("A123457")))))));
        WireMock.stubFor(get("/teamcat/resource/A999999").willReturn(notFound().withBody(notFoundJson())));
    }

    private static RestResponsePage<TeamKatTeam> teamMockResponse() {
        List<TeamKatTeam> teamKatTeams = List.of(defaultNoraTeam(), TeamKatTeam.builder().name("X Team").id("xteamR").productAreaId("productarea1").build());
        return new RestResponsePage<>(teamKatTeams);
    }

    private static RestResponsePage<TeamKatProductArea> productAreaMockResponse() {
        return new RestResponsePage<>(List.of(
                TeamKatProductArea.builder().id("productarea1").description("desc").name("Product Area 1").members(List.of(member())).build(),
                TeamKatProductArea.builder().id("productarea2").name("Product Area 2").build()
        ));
    }

    private static TeamKatTeam defaultNoraTeam() {
        return TeamKatTeam.builder().name("Visual Team Name").id("teamid1").description("desc").productAreaId("productarea1").slackChannel("slack")
                .members(List.of(member()))
                .build();
    }

    private static TeamKatMember member() {
        return TeamKatMember.builder().resource(
                TeamKatMember.Resource.builder().fullName("Member Name").email("member@email.com").build()).build();
    }

    private static Resource resource(String ident) {
        return Resource.builder()
                .navIdent(ident)
                .familyName("Family")
                .givenName("Given")
                .fullName("Given Family")
                .resourceType(ResourceType.EXTERNAL)
                .email("email@norge.no")
                .build();
    }

    private static String notFoundJson() {
        return "{\n"
                + "    \"timestamp\": \"" + LocalDateTime.now() + "\",\n"
                + "    \"status\": 500,\n"
                + "    \"error\": \"Resource not found\",\n"
                + "}";
    }
}
