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

import java.util.ArrayList;
import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.trimToNull;


@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class RisikoscenarioRequest implements RequestElement {

    private UUID id;
    private String pvkDokumentId;

    private String navn;
    private String beskrivelse;
    private Integer sannsynlighetsNivaa;
    private String sannsynlighetsNivaaBegrunnelse;
    private Integer konsekvensNivaa;
    private String konsekvensNivaaBegrunnelse;
    private boolean generelScenario;
    // relevanteKravNummer blir manipulert i egne endepunkt, og er derfor ikke en del av request
    private boolean tiltakOppdatert;
    private Boolean ingenTiltak;

    private Integer sannsynlighetsNivaaEtterTiltak;
    private Integer konsekvensNivaaEtterTiltak;
    private String nivaaBegrunnelseEtterTiltak;

    private Boolean update;

    @Override
    public void format() {
        setPvkDokumentId(trimToNull(pvkDokumentId));
        setNavn(trimToNull(navn));
        setBeskrivelse(trimToNull(beskrivelse));
        setSannsynlighetsNivaaBegrunnelse(trimToNull(sannsynlighetsNivaaBegrunnelse));
        setKonsekvensNivaaBegrunnelse(trimToNull(konsekvensNivaaBegrunnelse));
        setNivaaBegrunnelseEtterTiltak(trimToNull(nivaaBegrunnelseEtterTiltak));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
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
                .tiltakOppdatert(tiltakOppdatert)
                .ingenTiltak(ingenTiltak)
                .sannsynlighetsNivaaEtterTiltak(sannsynlighetsNivaaEtterTiltak)
                .konsekvensNivaaEtterTiltak(konsekvensNivaaEtterTiltak)
                .nivaaBegrunnelseEtterTiltak(nivaaBegrunnelseEtterTiltak)
                .relevanteKravNummer(new ArrayList<Integer>())
                .build();

        return Risikoscenario.builder()
                .id(id)
                .pvkDokumentId(UUID.fromString(pvkDokumentId))
                .risikoscenarioData(risikoscenarioData)
                .build();
    }

    public void mergeInto(Risikoscenario risikoscenarioToMerge) {
        risikoscenarioToMerge.setPvkDokumentId(UUID.fromString(pvkDokumentId));
        risikoscenarioToMerge.getRisikoscenarioData().setNavn(navn);
        risikoscenarioToMerge.getRisikoscenarioData().setBeskrivelse(beskrivelse);
        risikoscenarioToMerge.getRisikoscenarioData().setSannsynlighetsNivaa(sannsynlighetsNivaa);
        risikoscenarioToMerge.getRisikoscenarioData().setSannsynlighetsNivaaBegrunnelse(sannsynlighetsNivaaBegrunnelse);
        risikoscenarioToMerge.getRisikoscenarioData().setKonsekvensNivaa(konsekvensNivaa);
        risikoscenarioToMerge.getRisikoscenarioData().setKonsekvensNivaaBegrunnelse(konsekvensNivaaBegrunnelse);
        risikoscenarioToMerge.getRisikoscenarioData().setGenerelScenario(generelScenario);
        risikoscenarioToMerge.getRisikoscenarioData().setTiltakOppdatert(tiltakOppdatert);
        risikoscenarioToMerge.getRisikoscenarioData().setIngenTiltak(ingenTiltak);
        risikoscenarioToMerge.getRisikoscenarioData().setSannsynlighetsNivaaEtterTiltak(sannsynlighetsNivaaEtterTiltak);
        risikoscenarioToMerge.getRisikoscenarioData().setKonsekvensNivaaEtterTiltak(konsekvensNivaaEtterTiltak);
        risikoscenarioToMerge.getRisikoscenarioData().setNivaaBegrunnelseEtterTiltak(nivaaBegrunnelseEtterTiltak);
    }
}

