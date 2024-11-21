package no.nav.data.pvk.risikoscenario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.risikoscenario.domain.Riskoscenario;
import no.nav.data.pvk.risikoscenario.domain.RiskoscenarioData;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;
import static org.apache.commons.lang3.StringUtils.trimToNull;


@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class RiskoscenarioRequest implements RequestElement {
    private String id;
    private String pvkDokumentId;

    private String navn;
    private String beskrivelse;
    private Integer sannsynlighetsNivaa;
    private String sannsynlighetsNivaaBegrunnelse;
    private Integer konsekvensNivaa;
    private String konsekvensNivaaBegrunnelse;
    private List<Integer> relvanteKravNummerList;

    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setPvkDokumentId(trimToNull(pvkDokumentId));
        setNavn(trimToNull(navn));
        setBeskrivelse(trimToNull(beskrivelse));
        setSannsynlighetsNivaaBegrunnelse(trimToNull(sannsynlighetsNivaaBegrunnelse));
        setKonsekvensNivaaBegrunnelse(trimToNull(konsekvensNivaaBegrunnelse));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.pvkDokumentId, pvkDokumentId);
        validator.checkId(this);
    }


    public Riskoscenario convertToRiskoscenario() {
        var risikoscenarioData = RiskoscenarioData.builder()
                .navn(navn)
                .beskrivelse(beskrivelse)
                .sannsynlighetsNivaa(sannsynlighetsNivaa)
                .sannsynlighetsNivaaBegrunnelse(sannsynlighetsNivaaBegrunnelse)
                .konsekvensNivaa(konsekvensNivaa)
                .konsekvensNivaaBegrunnelse(konsekvensNivaaBegrunnelse)
                .relvanteKravNummerList(copyOf(relvanteKravNummerList))
                .build();

        return Riskoscenario.builder()
                .id(id != null && !id.isEmpty() ? UUID.fromString(id) : null)
                .pvkDokumentId(pvkDokumentId)
                .riskoscenarioData(risikoscenarioData)
                .build();
    }

    public void mergeInto(Riskoscenario riskoscenarioToMerge) {
        riskoscenarioToMerge.setPvkDokumentId(pvkDokumentId);
        riskoscenarioToMerge.getRiskoscenarioData().setNavn(navn);
        riskoscenarioToMerge.getRiskoscenarioData().setBeskrivelse(beskrivelse);
        riskoscenarioToMerge.getRiskoscenarioData().setSannsynlighetsNivaa(sannsynlighetsNivaa);
        riskoscenarioToMerge.getRiskoscenarioData().setKonsekvensNivaaBegrunnelse(sannsynlighetsNivaaBegrunnelse);
        riskoscenarioToMerge.getRiskoscenarioData().setKonsekvensNivaa(konsekvensNivaa);
        riskoscenarioToMerge.getRiskoscenarioData().setKonsekvensNivaaBegrunnelse(konsekvensNivaaBegrunnelse);
        riskoscenarioToMerge.getRiskoscenarioData().setRelvanteKravNummerList(copyOf(relvanteKravNummerList));
    }
}

