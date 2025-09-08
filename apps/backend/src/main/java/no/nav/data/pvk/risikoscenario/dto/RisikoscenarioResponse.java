package no.nav.data.pvk.risikoscenario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.krav.domain.KravReference;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    @Builder.Default
    private List<KravReference> relevanteKravNummer = new ArrayList<>();
    private List<UUID> tiltakIds; // denne blir ikke satt i buildFrom
    private  boolean tiltakOppdatert;
    private Boolean ingenTiltak;

    private Integer sannsynlighetsNivaaEtterTiltak;
    private Integer konsekvensNivaaEtterTiltak;
    private String nivaaBegrunnelseEtterTiltak;

    public static RisikoscenarioResponse buildFrom(Risikoscenario risikoscenario) {
        return RisikoscenarioResponse.builder()
                .id(risikoscenario.getId())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(risikoscenario.getCreatedDate() == null ? LocalDateTime.now() : risikoscenario.getCreatedDate())
                        .lastModifiedBy(risikoscenario.getLastModifiedBy())
                        .lastModifiedDate(risikoscenario.getLastModifiedDate() == null ? LocalDateTime.now() : risikoscenario.getLastModifiedDate())
                        .build())
                .version(risikoscenario.getVersion())
                .pvkDokumentId(risikoscenario.getPvkDokumentId().toString())
                .navn(risikoscenario.getRisikoscenarioData().getNavn())
                .beskrivelse(risikoscenario.getRisikoscenarioData().getBeskrivelse())
                .sannsynlighetsNivaa(risikoscenario.getRisikoscenarioData().getSannsynlighetsNivaa())
                .sannsynlighetsNivaaBegrunnelse(risikoscenario.getRisikoscenarioData().getSannsynlighetsNivaaBegrunnelse())
                .konsekvensNivaa(risikoscenario.getRisikoscenarioData().getKonsekvensNivaa())
                .konsekvensNivaaBegrunnelse(risikoscenario.getRisikoscenarioData().getKonsekvensNivaaBegrunnelse())
                .generelScenario(risikoscenario.getRisikoscenarioData().isGenerelScenario())
                .relevanteKravNummer(risikoscenario.getRisikoscenarioData().getRelevanteKravNummer().stream().map(kravNummer -> KravReference.builder().kravNummer(kravNummer).build()).collect(Collectors.toList()))
                .tiltakOppdatert(risikoscenario.getRisikoscenarioData().isTiltakOppdatert())
                .ingenTiltak(risikoscenario.getRisikoscenarioData().getIngenTiltak())
                .sannsynlighetsNivaaEtterTiltak(risikoscenario.getRisikoscenarioData().getSannsynlighetsNivaaEtterTiltak())
                .konsekvensNivaaEtterTiltak(risikoscenario.getRisikoscenarioData().getKonsekvensNivaaEtterTiltak())
                .nivaaBegrunnelseEtterTiltak(risikoscenario.getRisikoscenarioData().getNivaaBegrunnelseEtterTiltak())
                .build();
    }
}
