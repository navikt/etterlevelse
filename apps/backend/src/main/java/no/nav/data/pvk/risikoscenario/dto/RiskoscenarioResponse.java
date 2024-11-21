package no.nav.data.pvk.risikoscenario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.pvk.risikoscenario.domain.Riskoscenario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RiskoscenarioResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private String pvkDokumentId;

    private String navn;
    private String beskrivelse;
    private Integer sannsynlighetsNivaa;
    private String sannsynlighetsNivaaBegrunnelse;
    private Integer konsekvensNivaa;
    private String konsekvensNivaaBegrunnelse;
    private List<Integer> relvanteKravNummerList;

    public static RiskoscenarioResponse buildFrom(Riskoscenario riskoscenario) {
        return RiskoscenarioResponse.builder()
                .id(riskoscenario.getId())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(riskoscenario.getCreatedDate() == null ? LocalDateTime.now() : riskoscenario.getCreatedDate())
                        .lastModifiedBy(riskoscenario.getLastModifiedBy())
                        .lastModifiedDate(riskoscenario.getLastModifiedDate() == null ? LocalDateTime.now() : riskoscenario.getLastModifiedDate())
                        .build())
                .version(riskoscenario.getVersion())
                .pvkDokumentId(riskoscenario.getPvkDokumentId())

                .navn(riskoscenario.getRiskoscenarioData().getNavn())
                .beskrivelse(riskoscenario.getRiskoscenarioData().getBeskrivelse())
                .sannsynlighetsNivaa(riskoscenario.getRiskoscenarioData().getSannsynlighetsNivaa())
                .sannsynlighetsNivaaBegrunnelse(riskoscenario.getRiskoscenarioData().getSannsynlighetsNivaaBegrunnelse())
                .konsekvensNivaa(riskoscenario.getRiskoscenarioData().getKonsekvensNivaa())
                .konsekvensNivaaBegrunnelse(riskoscenario.getRiskoscenarioData().getKonsekvensNivaaBegrunnelse())
                .relvanteKravNummerList(riskoscenario.getRiskoscenarioData().getRelvanteKravNummerList())
                .build();
    }
}
