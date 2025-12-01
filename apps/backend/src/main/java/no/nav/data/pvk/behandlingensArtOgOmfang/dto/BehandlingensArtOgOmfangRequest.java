package no.nav.data.pvk.behandlingensArtOgOmfang.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfang;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfangData;
import no.nav.data.pvk.pvkdokument.dto.PvkDokumentRequest;

import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingensArtOgOmfangRequest implements RequestElement {

    private UUID id;
    private UUID etterlevelseDokumensjonId;

    private Boolean stemmerPersonkategorier;
    private String personkategoriAntallBeskrivelse;
    private String tilgangsBeskrivelsePersonopplysningene;
    private String lagringsBeskrivelsePersonopplysningene;

    private Boolean update;

    @Override
    public void format() {
        setPersonkategoriAntallBeskrivelse(trimToNull(personkategoriAntallBeskrivelse));
        setTilgangsBeskrivelsePersonopplysningene(trimToNull(tilgangsBeskrivelsePersonopplysningene));
        setLagringsBeskrivelsePersonopplysningene(trimToNull(lagringsBeskrivelsePersonopplysningene));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkNull(PvkDokumentRequest.Fields.etterlevelseDokumentId, etterlevelseDokumensjonId);
        validator.checkId(this);
    }

    public BehandlingensArtOgOmfang convertToBehandlingensArtOgOmfang() {
        var behandlingensArtOgOmfangData = BehandlingensArtOgOmfangData.builder()
                .personkategoriAntallBeskrivelse(personkategoriAntallBeskrivelse)
                .tilgangsBeskrivelsePersonopplysningene(tilgangsBeskrivelsePersonopplysningene)
                .lagringsBeskrivelsePersonopplysningene(lagringsBeskrivelsePersonopplysningene)
                .stemmerPersonkategorier(stemmerPersonkategorier)
                .build();

        return BehandlingensArtOgOmfang.builder()
                .id(id)
                .etterlevelseDokumensjonId(etterlevelseDokumensjonId)
                .behandlingensArtOgOmfangData(behandlingensArtOgOmfangData)
                .build();
    }

    public void mergeInto(BehandlingensArtOgOmfang behandlingensArtOgOmfangToMerge) {
        behandlingensArtOgOmfangToMerge.setEtterlevelseDokumensjonId(etterlevelseDokumensjonId);
        behandlingensArtOgOmfangToMerge.getBehandlingensArtOgOmfangData().setPersonkategoriAntallBeskrivelse(personkategoriAntallBeskrivelse);
        behandlingensArtOgOmfangToMerge.getBehandlingensArtOgOmfangData().setTilgangsBeskrivelsePersonopplysningene(tilgangsBeskrivelsePersonopplysningene);
        behandlingensArtOgOmfangToMerge.getBehandlingensArtOgOmfangData().setLagringsBeskrivelsePersonopplysningene(lagringsBeskrivelsePersonopplysningene);
        behandlingensArtOgOmfangToMerge.getBehandlingensArtOgOmfangData().setStemmerPersonkategorier(stemmerPersonkategorier);
    }
}
