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
import org.springframework.util.Assert;

import java.util.List;

public final class SlackDtos {
    
    // FIXME
    
    /*
     * OBS!!! Instanser av noen av klassen her (Block m/ innhold) vil bli serialisert til en arbeidstabell, og der kan 
     * de være i flere dager. Derfor:
     * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere! 
     * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere! 
     * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere! 
     * Se no.nav.data.etterlevelse.krav.TilbakemeldingController.flushSlack() for manuell tømmin av arbeidstabellen.
     */

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PostMessageRequest {
        private String channel = null;
        private List<Block> blocks = null;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Block {

        private BlockType type = null;
        @JsonInclude(Include.NON_NULL)
        private Text text = null;

        public static Block header(String text) {
            return new Block(BlockType.header, Text.plain(text));
        }

        public static Block text(String text) {
            return new Block(BlockType.section, Text.markdown(text));
        }

        public static Block divider() {
            return new Block(BlockType.divider, null);
        }

        /**
         * Create Block with text, keeping other properties
         */
        public Block withText(String newText) {
            Assert.isTrue(text != null, "this is not a text block");
            return new Block(type, new Text(text.type, newText));
        }
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

        public static Text plain(String text) {
            return new Text(TextType.plain_text, text);
        }

        public static Text markdown(String text) {
            return new Text(TextType.mrkdwn, text);
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

}
