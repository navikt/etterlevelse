package no.nav.data.integration.slack.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Value;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.etterlevelse.varsel.domain.SlackChannel;
import no.nav.data.etterlevelse.varsel.domain.SlackUser;
import no.nav.data.integration.slack.SlackMeldingData.MeldingPart;

import java.util.ArrayList;
import java.util.List;

/**
 * These classes are to be used only for interaction with external services. Otherwise, use SlackMelding or SlackMeldingData.
 */
public final class SlackDtos {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PostMessageRequest {
        private String channel = null;
        private List<Block> blocks = null;
        public static PostMessageRequest createRequest(String channel, List<MeldingPart> parts) {
            return new PostMessageRequest(channel, convertPartsToBlocks(parts));
        }
    }

    @Data
    public static class PostMessageResponse implements Response {

        private boolean ok;
        private Double ts;
        private String error;
        @JsonProperty("response_metadata")
        private JsonNode responseMetadata;

        @Override
        public String getError() {
            return error + "\n" + JsonUtils.toJson(responseMetadata);
        }

    }

    @Value
    public static class CreateConversationRequest {

        List<String> users;

        public CreateConversationRequest(String userId) {
            this.users = List.of(userId);
        }
    }

    @Data
    public static class CreateConversationResponse implements Response {
        private boolean ok;
        private String error;
        private Channel channel;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Block {
        private BlockType type = null;
        @JsonInclude(Include.NON_NULL)
        private Text text = null;
    }

    public enum BlockType {
        header, section, divider
    }

    public enum TextType {
        mrkdwn, plain_text
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Text {
        private TextType type;
        private String text;
    }

    @Data
    public static class Channel {

        private String id;
        private String name;
        @JsonProperty("num_members")
        private Integer numMembers;

        public SlackChannel toDomain() {
            return new SlackChannel(id, name, numMembers);
        }
    }

    @Data
    public static class UserResponse implements Response {

        private boolean ok;
        private String error;
        private User user;

        @Data
        public static class User {

            private String id;
            @JsonProperty("real_name")
            private String name;

            public SlackUser toDomain() {
                return new SlackUser(id, name);
            }

        }
    }

    @Data
    public static class ResponseMetadata {
        @JsonProperty("next_cursor")
        private String nextCursor;
    }

    @Data
    public static class ListChannelResponse implements Response {

        private boolean ok;
        private String error;
        private List<Channel> channels;
        @JsonProperty("response_metadata")
        private ResponseMetadata responseMetadata;
    }

    public interface Response {
        boolean isOk();
        String getError();
    }

    private static List<Block> convertPartsToBlocks(List<MeldingPart> parts) {
        List<Block> result = new ArrayList<>();
        for (MeldingPart part : parts) {
            BlockType blockType = BlockType.valueOf(part.getPartType().name()); // This works as long as the items have the same name
            TextType textType = part.getTextType() == no.nav.data.integration.slack.SlackMeldingData.TextType.markdown ? TextType.mrkdwn : TextType.plain_text;
            Text text = new Text(textType, part.getText());
            result.add(new Block(blockType, text));
        }
        return result;
    }

}
