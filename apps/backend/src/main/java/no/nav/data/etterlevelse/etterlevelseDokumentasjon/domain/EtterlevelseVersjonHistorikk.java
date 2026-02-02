package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseVersjonHistorikk {
    @Builder.Default
    private Integer versjon = 1;
    private String godkjentAvRisikoeier;
    private LocalDateTime godkjentAvRisikoierDato;
    private LocalDateTime nyVersjonOpprettetDato;

    private List<KravTilstandHistorikk> kravTilstandHistorikk;

}
