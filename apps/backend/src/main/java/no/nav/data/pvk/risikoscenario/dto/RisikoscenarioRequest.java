package no.nav.data.pvk.risikoscenario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioData;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;
import static org.apache.commons.lang3.StringUtils.trimToNull;


@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class RisikoscenarioRequest implements RequestElement {
    private String id;
    private String pvkDokumentId;
    
    // FIXME: List<String> tiltak;

    private String navn;
    private String beskrivelse;
    private Integer sannsynlighetsNivaa;
    private String sannsynlighetsNivaaBegrunnelse;
    private Integer konsekvensNivaa;
    private String konsekvensNivaaBegrunnelse;
    private boolean generelScenario;
    // felt verdiene som kommer fra frontend blir ignorert under lagring
    // dette feltet brukes av frontend for visualisering og defualt verdier
    private List<Integer> relevanteKravNummer;
    private List<Integer> kravToAdd;
    private List<Integer> kravToDelete;

    private Boolean ingenTiltak;

    private Integer sannsynlighetsNivaaEtterTiltak;
    private Integer konsekvensNivaaEtterTiltak;
    private String nivaaBegrunnelseEtterTiltak;

    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setPvkDokumentId(trimToNull(pvkDokumentId));
        setNavn(trimToNull(navn));
        setBeskrivelse(trimToNull(beskrivelse));
        setSannsynlighetsNivaaBegrunnelse(trimToNull(sannsynlighetsNivaaBegrunnelse));
        setKonsekvensNivaaBegrunnelse(trimToNull(konsekvensNivaaBegrunnelse));
        setNivaaBegrunnelseEtterTiltak(trimToNull(nivaaBegrunnelseEtterTiltak));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.pvkDokumentId, pvkDokumentId);
        validator.checkId(this);
    }


    public Risikoscenario convertToRisikoscenario() {
        var risikoscenarioData = RisikoscenarioData.builder()
                .navn(navn)
                .beskrivelse(beskrivelse)
                .sannsynlighetsNivaa(sannsynlighetsNivaa)
                .sannsynlighetsNivaaBegrunnelse(sannsynlighetsNivaaBegrunnelse)
                .konsekvensNivaa(konsekvensNivaa)
                .konsekvensNivaaBegrunnelse(konsekvensNivaaBegrunnelse)
                .generelScenario(generelScenario)
                .relevanteKravNummer(copyOf(relevanteKravNummer))
                .ingenTiltak(ingenTiltak)
                .sannsynlighetsNivaaEtterTiltak(sannsynlighetsNivaaEtterTiltak)
                .konsekvensNivaaEtterTiltak(konsekvensNivaaEtterTiltak)
                .nivaaBegrunnelseEtterTiltak(nivaaBegrunnelseEtterTiltak)
                .build();

        return Risikoscenario.builder()
                .id(id != null && !id.isEmpty() ? UUID.fromString(id) : null)
                .pvkDokumentId(pvkDokumentId)
                .risikoscenarioData(risikoscenarioData)
                .build();
    }

    public void mergeInto(Risikoscenario risikoscenarioToMerge) {
        risikoscenarioToMerge.setPvkDokumentId(pvkDokumentId);
        risikoscenarioToMerge.getRisikoscenarioData().setNavn(navn);
        risikoscenarioToMerge.getRisikoscenarioData().setBeskrivelse(beskrivelse);
        risikoscenarioToMerge.getRisikoscenarioData().setSannsynlighetsNivaa(sannsynlighetsNivaa);
        risikoscenarioToMerge.getRisikoscenarioData().setSannsynlighetsNivaaBegrunnelse(sannsynlighetsNivaaBegrunnelse);
        risikoscenarioToMerge.getRisikoscenarioData().setKonsekvensNivaa(konsekvensNivaa);
        risikoscenarioToMerge.getRisikoscenarioData().setKonsekvensNivaaBegrunnelse(konsekvensNivaaBegrunnelse);
        risikoscenarioToMerge.getRisikoscenarioData().setGenerelScenario(generelScenario);
        risikoscenarioToMerge.getRisikoscenarioData().setRelevanteKravNummer(copyOf(relevanteKravNummer));
        risikoscenarioToMerge.getRisikoscenarioData().setIngenTiltak(ingenTiltak);
        risikoscenarioToMerge.getRisikoscenarioData().setSannsynlighetsNivaaEtterTiltak(sannsynlighetsNivaaEtterTiltak);
        risikoscenarioToMerge.getRisikoscenarioData().setKonsekvensNivaaEtterTiltak(konsekvensNivaaEtterTiltak);
        risikoscenarioToMerge.getRisikoscenarioData().setNivaaBegrunnelseEtterTiltak(nivaaBegrunnelseEtterTiltak);

    }
}

