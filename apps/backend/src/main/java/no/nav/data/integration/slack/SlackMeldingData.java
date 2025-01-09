package no.nav.data.integration.slack;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.Assert;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlackMeldingData {
    
    /*
     * OBS!!! Instanser av denne klassen vil bli serialisert til en arbeidstabell, og der kan de være i flere dager. Derfor:
     * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere! 
     * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere! 
     * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere!
     * Se no.nav.data.etterlevelse.krav.TilbakemeldingController.flushSlack() for manuell tømmin av arbeidstabellen.
     */
    
    public static final int PRIORITY_LOW = 0;
    public static final int PRIORITY_HIGH = 10;

    private String mottager;
    private boolean sendTilKanal;
    private int prioritet;
    private List<MeldingPart> parts;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MeldingPart {

        private PartType partType = null;
        
        private TextType textType;

        private String text;

        public static MeldingPart header(String text) {
            return new MeldingPart(PartType.header, TextType.plainText, text);
        }

        public static MeldingPart text(String text) {
            return new MeldingPart(PartType.section, TextType.markdown, text);
        }

        public static MeldingPart divider() {
            return new MeldingPart(PartType.divider, null, null);
        }

        /**
         * Create Block with text, keeping other properties
         */
        public MeldingPart withText(String newText) {
            Assert.isTrue(text != null, "this is not a text block");
            return new MeldingPart(partType, textType, newText);
        }
    }

    public enum PartType {
        header, section, divider
    }

    public enum TextType {
        markdown, plainText
    }

}
