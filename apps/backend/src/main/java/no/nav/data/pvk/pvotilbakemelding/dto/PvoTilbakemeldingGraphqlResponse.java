package no.nav.data.pvk.pvotilbakemelding.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonGraphQlResponse;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingData;

import java.time.LocalDateTime;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class PvoTilbakemeldingGraphqlResponse extends PvoTilbakemeldingResponse {
    private PvkDokumentStatus pvkDokumentStatus;
    private String etterlevelseDokumentasjonId;
    private EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjonData;
    private LocalDateTime sistEndretAvMeg;

    public static PvoTilbakemeldingGraphqlResponse buildFrom(PvoTilbakemelding pvoTilbakemelding) {
        PvoTilbakemeldingData pvoTilbakemeldingData = pvoTilbakemelding.getPvoTilbakemeldingData();
        return PvoTilbakemeldingGraphqlResponse.builder()
                .id(pvoTilbakemelding.getId())
                .changeStamp(ChangeStampResponse.buildFrom(pvoTilbakemelding))
                .version(pvoTilbakemelding.getVersion())
                .pvkDokumentId(pvoTilbakemelding.getPvkDokumentId().toString())
                .status(pvoTilbakemelding.getStatus())
                .merknadTilEtterleverEllerRisikoeier(pvoTilbakemeldingData.getMerknadTilEtterleverEllerRisikoeier())
                .sendtDato(pvoTilbakemeldingData.getSendtDato())
                .behandlingenslivslop(pvoTilbakemeldingData.getBehandlingenslivslop())
                .behandlingensArtOgOmfang(pvoTilbakemeldingData.getBehandlingensArtOgOmfang())
                .tilhorendeDokumentasjon(pvoTilbakemelding.getPvoTilbakemeldingData().getTilhorendeDokumentasjon())
                .innvolveringAvEksterne(pvoTilbakemeldingData.getInnvolveringAvEksterne())
                .risikoscenarioEtterTiltakk(pvoTilbakemeldingData.getRisikoscenarioEtterTiltakk())
                .ansvarlig(pvoTilbakemelding.getPvoTilbakemeldingData().getAnsvarlig())
                .arbeidGarVidere(pvoTilbakemelding.getPvoTilbakemeldingData().getArbeidGarVidere())
                .arbeidGarVidereBegrunnelse(pvoTilbakemelding.getPvoTilbakemeldingData().getArbeidGarVidereBegrunnelse())
                .behovForForhandskonsultasjon(pvoTilbakemelding.getPvoTilbakemeldingData().getBehovForForhandskonsultasjon())
                .behovForForhandskonsultasjonBegrunnelse(pvoTilbakemelding.getPvoTilbakemeldingData().getBehovForForhandskonsultasjonBegrunnelse())
                .pvoVurdering(pvoTilbakemelding.getPvoTilbakemeldingData().getPvoVurdering())
                .pvoFolgeOppEndringer(pvoTilbakemelding.getPvoTilbakemeldingData().getPvoFolgeOppEndringer())
                .vilFaPvkIRetur(pvoTilbakemelding.getPvoTilbakemeldingData().getVilFaPvkIRetur())
                .build();
    }
}
