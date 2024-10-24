package no.nav.data.pvk.pvkdokument.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentData;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentFil;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;

import java.util.List;
import java.util.UUID;

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

    private String behandlingensLivslopBeskrivelse;
    private List<String> ytterligereEgenskaper;
    private boolean skalUtforePvk;
    private String pvkVurderingsBegrunnelse;
    private boolean stemmerPersonkategorier;
    private String personkategoriAntallBeskrivelse;
    private String tilgangsBeskrivelsePersonopplysningene;
    private String lagringsBeskrivelsePersonopplysningene;

    private boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private boolean stemmerDatabehandlere;
    private boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

    private List<PvkDokumentFil> pvkDokumentFiler;

    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setEtterlevelseDokumentId(trimToNull(etterlevelseDokumentId));
        setBehandlingensLivslopBeskrivelse(trimToNull(behandlingensLivslopBeskrivelse));
        setPvkVurderingsBegrunnelse(trimToNull(pvkVurderingsBegrunnelse));
        setPersonkategoriAntallBeskrivelse(trimToNull(personkategoriAntallBeskrivelse));
        setTilgangsBeskrivelsePersonopplysningene(trimToNull(tilgangsBeskrivelsePersonopplysningene));
        setLagringsBeskrivelsePersonopplysningene(trimToNull(lagringsBeskrivelsePersonopplysningene));

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

    public PvkDokument convertToPvkDokument() {
        var pkvDokumentData = PvkDokumentData.builder()
                .behandlingensLivslopBeskrivelse(behandlingensLivslopBeskrivelse)
                .ytterligereEgenskaper(copyOf(ytterligereEgenskaper))
                .skalUtforePvk(skalUtforePvk)
                .pvkVurderingsBegrunnelse(pvkVurderingsBegrunnelse)
                .personkategoriAntallBeskrivelse(personkategoriAntallBeskrivelse)
                .tilgangsBeskrivelsePersonopplysningene(tilgangsBeskrivelsePersonopplysningene)
                .lagringsBeskrivelsePersonopplysningene(lagringsBeskrivelsePersonopplysningene)
                .stemmerPersonkategorier(stemmerPersonkategorier)
                .harInvolvertRepresentant(harInvolvertRepresentant)
                .representantInvolveringsBeskrivelse(representantInvolveringsBeskrivelse)
                .stemmerDatabehandlere(stemmerDatabehandlere)
                .harDatabehandlerRepresentantInvolvering(harDatabehandlerRepresentantInvolvering)
                .dataBehandlerRepresentantInvolveringBeskrivelse(dataBehandlerRepresentantInvolveringBeskrivelse)
                .build();

        return PvkDokument.builder()
                .id(id != null ? UUID.fromString(id) : null)
                .etterlevelseDokumentId(etterlevelseDokumentId)
                .status(status != null ? status : PvkDokumentStatus.AKTIV)
                .pvkDokumentData(pkvDokumentData)
                .build();
    }

    public void mergeInto(PvkDokument pvkDokumentToMerge) {
        pvkDokumentToMerge.setEtterlevelseDokumentId(etterlevelseDokumentId);
        pvkDokumentToMerge.setStatus(status);
        pvkDokumentToMerge.getPvkDokumentData().setBehandlingensLivslopBeskrivelse(behandlingensLivslopBeskrivelse);
        pvkDokumentToMerge.getPvkDokumentData().setYtterligereEgenskaper(copyOf(ytterligereEgenskaper));
        pvkDokumentToMerge.getPvkDokumentData().setSkalUtforePvk(skalUtforePvk);
        pvkDokumentToMerge.getPvkDokumentData().setPvkVurderingsBegrunnelse(pvkVurderingsBegrunnelse);
        pvkDokumentToMerge.getPvkDokumentData().setPersonkategoriAntallBeskrivelse(personkategoriAntallBeskrivelse);
        pvkDokumentToMerge.getPvkDokumentData().setTilgangsBeskrivelsePersonopplysningene(tilgangsBeskrivelsePersonopplysningene);
        pvkDokumentToMerge.getPvkDokumentData().setLagringsBeskrivelsePersonopplysningene(lagringsBeskrivelsePersonopplysningene);
        pvkDokumentToMerge.getPvkDokumentData().setStemmerPersonkategorier(stemmerPersonkategorier);
        pvkDokumentToMerge.getPvkDokumentData().setHarInvolvertRepresentant(harInvolvertRepresentant);
        pvkDokumentToMerge.getPvkDokumentData().setRepresentantInvolveringsBeskrivelse(representantInvolveringsBeskrivelse);
        pvkDokumentToMerge.getPvkDokumentData().setStemmerDatabehandlere(stemmerDatabehandlere);
        pvkDokumentToMerge.getPvkDokumentData().setDataBehandlerRepresentantInvolveringBeskrivelse(dataBehandlerRepresentantInvolveringBeskrivelse);

    }
}
