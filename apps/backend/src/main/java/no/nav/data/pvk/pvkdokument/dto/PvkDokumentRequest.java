package no.nav.data.pvk.pvkdokument.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.pvkdokument.domain.OpplysningtypeData;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class PvkDokumentRequest implements RequestElement {
    private String id;
    private String etterlevelseDokumentId;
    private PvkDokumentStatus status;

    private List<String> ytterligereEgenskaper;
    private boolean skalUtforePvk;
    private String pvkVurderingsBegrunnelse;
    private boolean stemmerOpplysningstypene;
    private List<OpplysningtypeData> opplysningtypeData;
    private String tilgangsBeskrivelseForOpplysningstyper;
    private String lagringsBeskrivelseForOpplysningstyper;

    private boolean stemmerPersonkategorier;
    private boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private boolean stemmerDatabehandlere;
    private boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setEtterlevelseDokumentId(trimToNull(etterlevelseDokumentId));
        setPvkVurderingsBegrunnelse(trimToNull(pvkVurderingsBegrunnelse));
        setOpplysningtypeData(copyOf(opplysningtypeData));
        setTilgangsBeskrivelseForOpplysningstyper(trimToNull(tilgangsBeskrivelseForOpplysningstyper));
        setLagringsBeskrivelseForOpplysningstyper(trimToNull(lagringsBeskrivelseForOpplysningstyper));

        setRepresentantInvolveringsBeskrivelse(trimToNull(representantInvolveringsBeskrivelse));
        setDataBehandlerRepresentantInvolveringBeskrivelse(trimToNull(dataBehandlerRepresentantInvolveringBeskrivelse));

        if (status == null) {
            status = PvkDokumentStatus.AKTIV;
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.etterlevelseDokumentId, etterlevelseDokumentId);
        validator.checkNull(Fields.status, status);
        validator.checkId(this);
    }
}
