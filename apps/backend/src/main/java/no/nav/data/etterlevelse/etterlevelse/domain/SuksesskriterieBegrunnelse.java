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

    private SuksesskriterieStatus suksesskriterieStatus;

    @Builder.Default
    private boolean veiledning = false;
    private String veiledningsTekst;


    public static SuksesskriterieBegrunnelse convert(SuksesskriterieBegrunnelseRequest request) {
        return SuksesskriterieBegrunnelse.builder()
                .suksesskriterieId(request.getSuksesskriterieId())
                .begrunnelse(request.getBegrunnelse())
                .suksesskriterieStatus(request.getSuksesskriterieStatus())
                .veiledning(request.isVeiledning())
                .veiledningsTekst(request.getVeiledningsTekst())
                .build();
    }

    public SuksesskriterieBegrunnelseResponse toResponse() {
        return SuksesskriterieBegrunnelseResponse.builder()
                .suksesskriterieId(suksesskriterieId)
                .begrunnelse(begrunnelse)
                .suksesskriterieStatus(suksesskriterieStatus)
                .veiledning(veiledning)
                .veiledningsTekst(veiledningsTekst)
                .build();
    }
}
