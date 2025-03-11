package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.*;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class PvoTilbakemeldingData {
    private Tilbakemeldingsinnhold behandlingensArtOgOmfang;
    private Tilbakemeldingsinnhold InnvolveringAvEksterne;
    private Tilbakemeldingsinnhold risikoscenarioEtterTiltakk;
}
