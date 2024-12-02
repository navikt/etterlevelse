package no.nav.data.pvk.risikoscenario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RisikoscenarioResponse {
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
    private boolean generelScenario;
    private List<KravShort> relvanteKravNummerList;

    public static RisikoscenarioResponse buildFrom(Risikoscenario risikoscenario) {
        return RisikoscenarioResponse.builder()
                .id(risikoscenario.getId())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(risikoscenario.getCreatedDate() == null ? LocalDateTime.now() : risikoscenario.getCreatedDate())
                        .lastModifiedBy(risikoscenario.getLastModifiedBy())
                        .lastModifiedDate(risikoscenario.getLastModifiedDate() == null ? LocalDateTime.now() : risikoscenario.getLastModifiedDate())
                        .build())
                .version(risikoscenario.getVersion())
                .pvkDokumentId(risikoscenario.getPvkDokumentId())

                .navn(risikoscenario.getRisikoscenarioData().getNavn())
                .beskrivelse(risikoscenario.getRisikoscenarioData().getBeskrivelse())
                .sannsynlighetsNivaa(risikoscenario.getRisikoscenarioData().getSannsynlighetsNivaa())
                .sannsynlighetsNivaaBegrunnelse(risikoscenario.getRisikoscenarioData().getSannsynlighetsNivaaBegrunnelse())
                .konsekvensNivaa(risikoscenario.getRisikoscenarioData().getKonsekvensNivaa())
                .konsekvensNivaaBegrunnelse(risikoscenario.getRisikoscenarioData().getKonsekvensNivaaBegrunnelse())
                .generelScenario(risikoscenario.getRisikoscenarioData().isGenerelScenario())
                .relvanteKravNummerList(risikoscenario.getRisikoscenarioData().getRelvanteKravNummerList().stream().map(kravNummer -> KravShort.builder().kravNummer(kravNummer).build()).collect(Collectors.toList()))
                .build();
    }
}
