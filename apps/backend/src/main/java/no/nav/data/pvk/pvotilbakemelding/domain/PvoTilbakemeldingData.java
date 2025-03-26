package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class PvoTilbakemeldingData {
    private Tilbakemeldingsinnhold behandlingenslivslop;
    private Tilbakemeldingsinnhold behandlingensArtOgOmfang;
    private Tilbakemeldingsinnhold innvolveringAvEksterne;
    private Tilbakemeldingsinnhold risikoscenarioEtterTiltakk;
    private String merknadTilEtterleverEllerRisikoeier;
    private LocalDateTime sendtDato;
}
