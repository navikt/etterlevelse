package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseVersjonHistorikk {
    @Builder.Default
    private Integer versjon = 1;
    private String godkjentAvRisikoeier;
    private LocalDateTime godkjentAvRiskoierDato;
    private LocalDateTime nyVersjonOpprettetDato;
}
