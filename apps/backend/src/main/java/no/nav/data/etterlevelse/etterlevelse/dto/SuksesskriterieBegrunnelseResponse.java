package no.nav.data.etterlevelse.etterlevelse.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieBegrunnelse;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "begrunnelse", "suksesskriterieStatus"})
public class SuksesskriterieBegrunnelseResponse {
    private int suksesskriterieId;
    private String begrunnelse;

    private SuksesskriterieStatus suksesskriterieStatus;

    private boolean veiledning;
    private String veiledningsTekst;
    private String veiledningsTekst2;
    
    public static SuksesskriterieBegrunnelseResponse buildFrom(SuksesskriterieBegrunnelse sb) {
        return SuksesskriterieBegrunnelseResponse.builder()
                .suksesskriterieId(sb.getSuksesskriterieId())
                .begrunnelse(sb.getBegrunnelse())
                .suksesskriterieStatus(sb.getSuksesskriterieStatus())
                .veiledning(sb.isVeiledning())
                .veiledningsTekst(sb.getVeiledningsTekst())
                .veiledningsTekst2(sb.getVeiledningsTekst2())
                .build();
    }

}
