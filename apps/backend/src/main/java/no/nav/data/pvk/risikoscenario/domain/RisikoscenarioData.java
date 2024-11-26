package no.nav.data.pvk.risikoscenario.domain;


import lombok.*;

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
    private List<Integer> relvanteKravNummerList;

}
