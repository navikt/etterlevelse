package no.nav.data.pvk.pvotilbakemelding.domain;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class PvoTilbakemeldingData {
    private Tilbakemeldingsinnhold behandlingenslivslop;
    private Tilbakemeldingsinnhold behandlingensArtOgOmfang;
    private TilhorendeDokumentasjonTilbakemelding tilhorendeDokumentasjon;
    private Tilbakemeldingsinnhold innvolveringAvEksterne;
    private Tilbakemeldingsinnhold risikoscenarioEtterTiltakk;
    private String merknadTilEtterleverEllerRisikoeier;
    private LocalDateTime sendtDato;
    private List<String> ansvarlig;

    private Boolean arbeidGarVidere;
    private String arbeidGarVidereBegrunnelse;
    private Boolean behovForForhandskonsultasjon;
    private String behovForForhandskonsultasjonBegrunnelse;

    private String pvoVurdering;
    private Boolean pvoFolgeOppEndringer;
    private Boolean vilFaPvkIRetur;
}


