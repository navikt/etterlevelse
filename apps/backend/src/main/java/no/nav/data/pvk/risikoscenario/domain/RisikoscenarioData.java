package no.nav.data.pvk.risikoscenario.domain;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class RisikoscenarioData {
    private String navn;
    private String beskrivelse;
    private Integer sannsynlighetsNivaa;
    private String sannsynlighetsNivaaBegrunnelse;
    private Integer konsekvensNivaa;
    private String konsekvensNivaaBegrunnelse;
    private boolean generelScenario;
    private List<Integer> relevanteKravNummer;

}
