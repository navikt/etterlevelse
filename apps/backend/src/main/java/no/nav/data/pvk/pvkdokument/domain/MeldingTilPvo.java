package no.nav.data.pvk.pvkdokument.domain;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class MeldingTilPvo {
    private int etterlevelsesDokumentVersjon;
    private int innsendingId;
    private String merknadTilPvo;
    private String endringsNotat;
    private LocalDateTime sendtTilPvoDato;
    private String sendtTilPvoAv;
}
