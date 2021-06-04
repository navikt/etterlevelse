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
    private int id;
    private String begrunnelse;


    public static SuksesskriterieBegrunnelse convert(SuksesskriterieBegrunnelseRequest request) {
        return SuksesskriterieBegrunnelse.builder()
                .id(request.getId())
                .begrunnelse(request.getBegrunnelse())
                .build();
    }

    public SuksesskriterieBegrunnelseResponse toResponse() {
        return SuksesskriterieBegrunnelseResponse.builder()
                .id(id)
                .begrunnelse(begrunnelse)
                .build();
    }
}
