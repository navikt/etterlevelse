package no.nav.data.etterlevelse.etterlevelse.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.etterlevelse.dto.SuksesskriterieBegrunnelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.SuksesskriterieBegrunnelseResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuksesskriterieBegrunnelse {
    private int suksesskriterieId;
    private String begrunnelse;
    private Boolean oppfylt;
    private Boolean ikkeRelevant;


    public static SuksesskriterieBegrunnelse convert(SuksesskriterieBegrunnelseRequest request) {
        return SuksesskriterieBegrunnelse.builder()
                .suksesskriterieId(request.getSuksesskriterieId())
                .begrunnelse(request.getBegrunnelse())
                .oppfylt(request.getOppfylt())
                .ikkeRelevant(request.getIkkeRelevant())
                .build();
    }

    public SuksesskriterieBegrunnelseResponse toResponse() {
        return SuksesskriterieBegrunnelseResponse.builder()
                .suksesskriterieId(suksesskriterieId)
                .begrunnelse(begrunnelse)
                .oppfylt(oppfylt)
                .ikkeRelevant(ikkeRelevant)
                .build();
    }
}
