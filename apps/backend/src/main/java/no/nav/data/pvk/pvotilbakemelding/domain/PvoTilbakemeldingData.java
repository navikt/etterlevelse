package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.*;

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
}
