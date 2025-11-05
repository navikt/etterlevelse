package no.nav.data.pvk.pvotilbakemelding.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.pvk.pvotilbakemelding.domain.Tilbakemeldingsinnhold;
import no.nav.data.pvk.pvotilbakemelding.domain.TilhorendeDokumentasjonTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.Vurdering;

import java.time.LocalDateTime;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class VurderingResponse  {
    private int innsendingId;
    private Tilbakemeldingsinnhold behandlingenslivslop;
    private Tilbakemeldingsinnhold behandlingensArtOgOmfang;
    private TilhorendeDokumentasjonTilbakemelding tilhorendeDokumentasjon;
    private Tilbakemeldingsinnhold innvolveringAvEksterne;
    private Tilbakemeldingsinnhold risikoscenarioEtterTiltakk;
    private String merknadTilEtterleverEllerRisikoeier;
    private LocalDateTime sendtDato;
    private List<String> ansvarlig;
    private List<Resource> ansvarligData;

    private Boolean arbeidGarVidere;
    private String arbeidGarVidereBegrunnelse;
    private Boolean behovForForhandskonsultasjon;
    private String behovForForhandskonsultasjonBegrunnelse;

    private String pvoVurdering;
    private Boolean pvoFolgeOppEndringer;
    private Boolean vilFaPvkIRetur;

    public static VurderingResponse buildFrom(Vurdering vurdering) {
        return VurderingResponse.builder()
                .innsendingId(vurdering.getInnsendingId())
                .behandlingenslivslop(vurdering.getBehandlingenslivslop())
                .behandlingensArtOgOmfang(vurdering.getBehandlingensArtOgOmfang())
                .tilhorendeDokumentasjon(vurdering.getTilhorendeDokumentasjon())
                .innvolveringAvEksterne(vurdering.getInnvolveringAvEksterne())
                .risikoscenarioEtterTiltakk(vurdering.getRisikoscenarioEtterTiltakk())
                .merknadTilEtterleverEllerRisikoeier(vurdering.getMerknadTilEtterleverEllerRisikoeier())
                .sendtDato(vurdering.getSendtDato())
                .ansvarlig(copyOf(vurdering.getAnsvarlig()))
                .arbeidGarVidere(vurdering.getArbeidGarVidere())
                .arbeidGarVidereBegrunnelse(vurdering.getArbeidGarVidereBegrunnelse())
                .behovForForhandskonsultasjon(vurdering.getBehovForForhandskonsultasjon())
                .behovForForhandskonsultasjonBegrunnelse(vurdering.getBehovForForhandskonsultasjonBegrunnelse())
                .pvoVurdering(vurdering.getPvoVurdering())
                .pvoFolgeOppEndringer(vurdering.getPvoFolgeOppEndringer())
                .vilFaPvkIRetur(vurdering.getVilFaPvkIRetur())
                .build();
    }
}
