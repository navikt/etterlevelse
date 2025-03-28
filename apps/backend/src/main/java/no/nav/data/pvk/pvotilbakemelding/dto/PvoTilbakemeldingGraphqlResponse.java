package no.nav.data.pvk.pvotilbakemelding.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.common.utils.HibernateUtils;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
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
    private EtterlevelseDokumentasjon etterlevelseDokumentasjonData;
    private LocalDateTime sistEndretAvMeg;

    public static PvoTilbakemeldingGraphqlResponse buildFrom(PvoTilbakemelding pvoTilbakemelding) {
        HibernateUtils.initialize(pvoTilbakemelding); // Fully loads input if it is a detached proxy
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
                .innvolveringAvEksterne(pvoTilbakemeldingData.getInnvolveringAvEksterne())
                .risikoscenarioEtterTiltakk(pvoTilbakemeldingData.getRisikoscenarioEtterTiltakk())
                .build();
    }
}
