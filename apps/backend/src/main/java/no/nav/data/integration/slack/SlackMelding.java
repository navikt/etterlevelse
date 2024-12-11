package no.nav.data.integration.slack;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.integration.slack.dto.SlackDtos.Block;
import org.hibernate.annotations.Type;

import java.util.List;


/**
 * Denne klassen inneholder en slack melding som skal sendes.
 * Meldingene persisteres i en arbeidstabell og slettes når de er sendt.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "SLACK_MELDING")
public class SlackMelding {
    
    public static final int PRIORITY_LOW = 0;
    public static final int PRIORITY_HIGH = 10;

    @Id
    @SequenceGenerator(name = "slack_melding_id_seq", sequenceName = "slack_melding_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "slack_melding_id_seq")
    @Column(name = "id")
    private Integer id;
    
    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private SlackMeldingData data = new SlackMeldingData();
    
    public SlackMelding(String mottager, boolean tilKanal, int prioritet, List<Block> blocks) {
        data = new SlackMeldingData();
        data.mottager = mottager;
        data.sendTilKanal = tilKanal;
        data.prioritet = prioritet;
        data.blocks = blocks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlackMeldingData {
        
        /*
         * OBS!!! Instanser av denne klassen vil bli serialisert til en arbeidstabell, og der kan de være i flere dager. Derfor:
         * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere! 
         * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere! 
         * Ikke gjør endringer her som medfører at eksisterende rader i arbeidstabellen ikke lar seg deserialisere!
         * Se no.nav.data.etterlevelse.krav.TilbakemeldingController.flushSlack() for manuell tømmin av arbeidstabellen.
         */
        
        private String mottager;
        private boolean sendTilKanal;
        private int prioritet; // == 0 → send bulk, >= 10 → send ASAP
        private List<Block> blocks;
    }
    
    // The rest is boilerplate to access fields of contained SlackMeldingData

    public String getMottager() {
        return data.mottager;
    }

    public boolean getSendTilKanal() {
        return data.sendTilKanal;
    }

    public List<Block> getBlocks() {
        return data.blocks;
    }
    
}
