package no.nav.data.integration.slack;

import com.github.tomakehurst.wiremock.client.WireMock;
import no.nav.data.integration.slack.dto.SlackDtos.Channel;
import no.nav.data.integration.slack.dto.SlackDtos.ListChannelResponse;
import no.nav.data.integration.slack.dto.SlackDtos.ResponseMetadata;
import org.jetbrains.annotations.NotNull;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static no.nav.data.common.utils.JsonUtils.toJson;

public class SlackMocks {

    public static void mock() {
        WireMock.stubFor(post("/slack/conversations.list").willReturn(okJson(toJson(getListChannelResponse()))));
    }

    @NotNull
    private static ListChannelResponse getListChannelResponse() {
        ListChannelResponse res = new ListChannelResponse();
        res.setOk(true);
        ResponseMetadata metadata = new ResponseMetadata();
        metadata.setNextCursor("");
        res.setResponseMetadata(metadata);

        Channel channel = new Channel();
        channel.setId("xyz");
        channel.setName("XYZ channel");
        res.setChannels(List.of(channel));
        return res;
    }
}
