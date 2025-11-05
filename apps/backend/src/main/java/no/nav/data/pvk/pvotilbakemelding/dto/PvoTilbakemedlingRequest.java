package no.nav.data.pvk.pvotilbakemelding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.pvotilbakemelding.domain.*;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.*;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class PvoTilbakemedlingRequest implements RequestElement {

    private UUID id;
    private String pvkDokumentId;
    private PvoTilbakemeldingStatus status;
    private List<VurderingRequest> vurderinger;

    private Boolean update;

    @Override
    public void format() {
        setPvkDokumentId(trimToNull(pvkDokumentId));
        setVurderinger(copyOf(vurderinger));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.pvkDokumentId, pvkDokumentId);
        validator.checkNull(Fields.status, status);
        validator.checkId(this);
        if (duplicates(vurderinger, VurderingRequest::getInnsendingId)) {
            validator.addError(Fields.vurderinger, "DUPLICATE_VURDERING", "Dukplikat på innsending id av vurderinger");
        }
    }

    public PvoTilbakemelding convertToPvoTilbakemelding() {

        var pvoTilbakemeldingData = PvoTilbakemeldingData.builder()
                .vurderinger(copyOf(convert(vurderinger, VurderingRequest::convertToVurdering)))
                .build();

        return PvoTilbakemelding.builder()
                .id(id)
                .pvkDokumentId(UUID.fromString(pvkDokumentId))
                .status(status != null ? status : PvoTilbakemeldingStatus.UNDERARBEID)
                .pvoTilbakemeldingData(pvoTilbakemeldingData)
                .build();
    }

    public void mergeInto(PvoTilbakemelding pvoTilbakemeldingToMerge) {
        pvoTilbakemeldingToMerge.setPvkDokumentId(UUID.fromString(pvkDokumentId));
        pvoTilbakemeldingToMerge.setStatus(status);
        pvoTilbakemeldingToMerge.getPvoTilbakemeldingData().setVurderinger(copyOf(convert(vurderinger, VurderingRequest::convertToVurdering)));
    }
}
