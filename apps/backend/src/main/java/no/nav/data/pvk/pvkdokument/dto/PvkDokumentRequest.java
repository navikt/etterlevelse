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
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;

import java.time.LocalDateTime;
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

    private UUID id;
    private UUID etterlevelseDokumentId;
    private PvkDokumentStatus status;

    private List<String> ytterligereEgenskaper;
    private Boolean skalUtforePvk;
    private String pvkVurderingsBegrunnelse;
    private Boolean stemmerPersonkategorier;
    private String personkategoriAntallBeskrivelse;
    private String tilgangsBeskrivelsePersonopplysningene;
    private String lagringsBeskrivelsePersonopplysningene;

    private Boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private Boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

    private String merknadTilPvoEllerRisikoeier;
    private String merknadTilRisikoeier;
    private String merknadFraRisikoeier;

    private LocalDateTime sendtTilPvoDato;
    private String sendtTilPvoAv;

    private LocalDateTime godkjentAvRisikoeierDato;
    private String godkjentAvRisikoeier;

    private Boolean update;

    @Override
    public void format() {
        setPvkVurderingsBegrunnelse(trimToNull(pvkVurderingsBegrunnelse));
        setPersonkategoriAntallBeskrivelse(trimToNull(personkategoriAntallBeskrivelse));
        setTilgangsBeskrivelsePersonopplysningene(trimToNull(tilgangsBeskrivelsePersonopplysningene));
        setLagringsBeskrivelsePersonopplysningene(trimToNull(lagringsBeskrivelsePersonopplysningene));

        setRepresentantInvolveringsBeskrivelse(trimToNull(representantInvolveringsBeskrivelse));
        setDataBehandlerRepresentantInvolveringBeskrivelse(trimToNull(dataBehandlerRepresentantInvolveringBeskrivelse));

        setMerknadTilPvoEllerRisikoeier(trimToNull(merknadTilPvoEllerRisikoeier));
        setMerknadTilRisikoeier(trimToNull(merknadTilRisikoeier));
        setMerknadFraRisikoeier(trimToNull(merknadFraRisikoeier));

        if (status == null || status == PvkDokumentStatus.AKTIV) {
            status = PvkDokumentStatus.UNDERARBEID;
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkNull(Fields.etterlevelseDokumentId, etterlevelseDokumentId);
        validator.checkNull(Fields.status, status);
        validator.checkId(this);
    }

    public PvkDokument convertToPvkDokument() {
        var pkvDokumentData = PvkDokumentData.builder()
                .ytterligereEgenskaper(copyOf(ytterligereEgenskaper))
                .skalUtforePvk(skalUtforePvk)
                .pvkVurderingsBegrunnelse(pvkVurderingsBegrunnelse)
                .personkategoriAntallBeskrivelse(personkategoriAntallBeskrivelse)
                .tilgangsBeskrivelsePersonopplysningene(tilgangsBeskrivelsePersonopplysningene)
                .lagringsBeskrivelsePersonopplysningene(lagringsBeskrivelsePersonopplysningene)
                .stemmerPersonkategorier(stemmerPersonkategorier)
                .harInvolvertRepresentant(harInvolvertRepresentant)
                .representantInvolveringsBeskrivelse(representantInvolveringsBeskrivelse)
                .harDatabehandlerRepresentantInvolvering(harDatabehandlerRepresentantInvolvering)
                .dataBehandlerRepresentantInvolveringBeskrivelse(dataBehandlerRepresentantInvolveringBeskrivelse)
                .merknadTilPvoEllerRisikoeier(merknadTilPvoEllerRisikoeier)
                .merknadTilRisikoeier(merknadTilRisikoeier)
                .merknadFraRisikoeier(merknadFraRisikoeier)
                .sendtTilPvoDato(sendtTilPvoDato)
                .sendtTilPvoAv(sendtTilPvoAv)
                .godkjentAvRisikoeierDato(godkjentAvRisikoeierDato)
                .godkjentAvRisikoeier(godkjentAvRisikoeier)
                .build();

        return PvkDokument.builder()
                .id(id)
                .etterlevelseDokumentId(etterlevelseDokumentId)
                .status(status != null ? status : PvkDokumentStatus.UNDERARBEID)
                .pvkDokumentData(pkvDokumentData)
                .build();
    }

    public void mergeInto(PvkDokument pvkDokumentToMerge) {
        pvkDokumentToMerge.setEtterlevelseDokumentId(etterlevelseDokumentId);
        pvkDokumentToMerge.setStatus(status);
        pvkDokumentToMerge.getPvkDokumentData().setYtterligereEgenskaper(copyOf(ytterligereEgenskaper));
        pvkDokumentToMerge.getPvkDokumentData().setSkalUtforePvk(skalUtforePvk);
        pvkDokumentToMerge.getPvkDokumentData().setPvkVurderingsBegrunnelse(pvkVurderingsBegrunnelse);
        pvkDokumentToMerge.getPvkDokumentData().setPersonkategoriAntallBeskrivelse(personkategoriAntallBeskrivelse);
        pvkDokumentToMerge.getPvkDokumentData().setTilgangsBeskrivelsePersonopplysningene(tilgangsBeskrivelsePersonopplysningene);
        pvkDokumentToMerge.getPvkDokumentData().setLagringsBeskrivelsePersonopplysningene(lagringsBeskrivelsePersonopplysningene);
        pvkDokumentToMerge.getPvkDokumentData().setStemmerPersonkategorier(stemmerPersonkategorier);
        pvkDokumentToMerge.getPvkDokumentData().setHarInvolvertRepresentant(harInvolvertRepresentant);
        pvkDokumentToMerge.getPvkDokumentData().setRepresentantInvolveringsBeskrivelse(representantInvolveringsBeskrivelse);
        pvkDokumentToMerge.getPvkDokumentData().setHarDatabehandlerRepresentantInvolvering(harDatabehandlerRepresentantInvolvering);
        pvkDokumentToMerge.getPvkDokumentData().setDataBehandlerRepresentantInvolveringBeskrivelse(dataBehandlerRepresentantInvolveringBeskrivelse);
        pvkDokumentToMerge.getPvkDokumentData().setMerknadTilPvoEllerRisikoeier(merknadTilPvoEllerRisikoeier);
        pvkDokumentToMerge.getPvkDokumentData().setMerknadTilRisikoeier(merknadTilRisikoeier);
        pvkDokumentToMerge.getPvkDokumentData().setMerknadFraRisikoeier(merknadFraRisikoeier);
        pvkDokumentToMerge.getPvkDokumentData().setSendtTilPvoDato(sendtTilPvoDato);
        pvkDokumentToMerge.getPvkDokumentData().setSendtTilPvoAv(sendtTilPvoAv);
        pvkDokumentToMerge.getPvkDokumentData().setGodkjentAvRisikoeierDato(godkjentAvRisikoeierDato);
        pvkDokumentToMerge.getPvkDokumentData().setGodkjentAvRisikoeier(godkjentAvRisikoeier);
    }
}
