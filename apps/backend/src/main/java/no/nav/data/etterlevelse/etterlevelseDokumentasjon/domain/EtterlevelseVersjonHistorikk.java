package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseVersjonHistorikk {
    private Integer versjon;
    private String godkjentAvRisikoeier;
    private LocalDateTime godkjentAvRiskoierDato;
    private LocalDateTime nyVersjonOpprettetDato;
}
