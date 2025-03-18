package no.nav.data.pvk.pvotilbakemelding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingData;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.Tilbakemeldingsinnhold;

import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class PvoTilbakemedlingRequest implements RequestElement {
    private String id;
    private String pvkDokumentId;
    private PvoTilbakemeldingStatus status;

    private Tilbakemeldingsinnhold behandlingensArtOgOmfang;
    private Tilbakemeldingsinnhold innvolveringAvEksterne;
    private Tilbakemeldingsinnhold risikoscenarioEtterTiltakk;
    private String merknadTilEtterleverEllerRisikoeier;

    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setPvkDokumentId(trimToNull(pvkDokumentId));

        getBehandlingensArtOgOmfang().setTilbakemeldingTilEtterlevere(trimToNull(behandlingensArtOgOmfang.getTilbakemeldingTilEtterlevere()));
        getBehandlingensArtOgOmfang().setInternDiskusjon(trimToNull(behandlingensArtOgOmfang.getInternDiskusjon()));

        getInnvolveringAvEksterne().setTilbakemeldingTilEtterlevere(trimToNull(innvolveringAvEksterne.getTilbakemeldingTilEtterlevere()));
        getInnvolveringAvEksterne().setInternDiskusjon(trimToNull(innvolveringAvEksterne.getInternDiskusjon()));

        getRisikoscenarioEtterTiltakk().setTilbakemeldingTilEtterlevere(trimToNull(risikoscenarioEtterTiltakk.getTilbakemeldingTilEtterlevere()));
        getRisikoscenarioEtterTiltakk().setInternDiskusjon(trimToNull(risikoscenarioEtterTiltakk.getInternDiskusjon()));
        setMerknadTilEtterleverEllerRisikoeier(trimToNull(merknadTilEtterleverEllerRisikoeier));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.pvkDokumentId, pvkDokumentId);
        validator.checkNull(Fields.status, status);
        validator.checkId(this);
    }

    public PvoTilbakemelding convertToPvoTilbakemelding() {

        var pvoTilbakemeldingData = PvoTilbakemeldingData.builder()
                .behandlingensArtOgOmfang(behandlingensArtOgOmfang)
                .innvolveringAvEksterne(innvolveringAvEksterne)
                .risikoscenarioEtterTiltakk(risikoscenarioEtterTiltakk)
                .merknadTilEtterleverEllerRisikoeier(merknadTilEtterleverEllerRisikoeier)
                .build();

        return PvoTilbakemelding.builder()
                .id(id != null && !id.isEmpty() ? UUID.fromString(id) : null)
                .pvkDokumentId(UUID.fromString(pvkDokumentId))
                .status(status != null ? status : PvoTilbakemeldingStatus.UNDERARBEID)
                .pvoTilbakemeldingData(pvoTilbakemeldingData)
                .build();
    }

    public void mergeInto(PvoTilbakemelding pvoTilbakemeldingToMerge) {
        pvoTilbakemeldingToMerge.setPvkDokumentId(UUID.fromString(pvkDokumentId));
        pvoTilbakemeldingToMerge.setStatus(status);
        pvoTilbakemeldingToMerge.getPvoTilbakemeldingData().setBehandlingensArtOgOmfang(behandlingensArtOgOmfang);
        pvoTilbakemeldingToMerge.getPvoTilbakemeldingData().setInnvolveringAvEksterne(innvolveringAvEksterne);
        pvoTilbakemeldingToMerge.getPvoTilbakemeldingData().setRisikoscenarioEtterTiltakk(risikoscenarioEtterTiltakk);
        pvoTilbakemeldingToMerge.getPvoTilbakemeldingData().setMerknadTilEtterleverEllerRisikoeier(merknadTilEtterleverEllerRisikoeier);

    }
}
