package no.nav.data.etterlevelse.varsel.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import lombok.Value;
import no.nav.data.integration.slack.dto.SlackDtos.PostMessageRequest.Block;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Varsel {

    private String title;
    @Singular
    private List<Paragraph> paragraphs;


    @Data
    public static class Paragraph {

        private String val;
        private List<VarselUrl> urls = new ArrayList<>();

        public Paragraph(String val) {
            this.val = val;
        }

        public Paragraph(String val, VarselUrl... urls) {
            this.val = val;
            this.urls = Arrays.asList(urls);
        }

        private String toSlack() {
            var urlsFormatted = convert(urls, u -> "<%s%s|%s>".formatted(u.url, source(u), u.name));
            return val.formatted(urlsFormatted.toArray());
        }

        private String toHtml() {
            var urlsFormatted = convert(urls, u -> "<a href=\"%s%s\">%s</a>".formatted(u.url, source(u), u.name));
            return val.formatted(urlsFormatted.toArray());
        }

        private String source(VarselUrl u) {
            return (u.url.contains("?") ? "&" : "?") + "source=varsel";
        }

        @Value
        public static class VarselUrl {

            String url;
            String name;

            public static VarselUrl url(String url, String name) {
                return new VarselUrl(url, name);
            }
        }

    }

    public List<Block> toSlack() {
        var blocks = new ArrayList<Block>();
        blocks.add(Block.header(title));

        paragraphs.forEach(p -> blocks.add(Block.text(p.toSlack())));

        return blocks;
    }

    public String toHtml() {
        return "<h1>%s</h1>".formatted(title) +
                String.join("\n", convert(paragraphs, p -> "<p>%s</p>".formatted(p.toHtml())));
    }

}
