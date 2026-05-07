package no.nav.data.etterlevelse.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TemaDashboardResponse {

    private String temaCode;
    private String temaName;
    private int kravTotal;
    private int kravUnderArbeid;
    private int kravFerdigVurdert;
    private int suksesskriterierUnderArbeid;
    private int suksesskriterierOppfylt;
    private int suksesskriterierIkkeOppfylt;
    private int suksesskriterierIkkeRelevant;

    private int ferdigUtfyltKravSuksesskriterierOppfylt;
    private int ferdigUtfyltKravSuksesskriterierIkkeOppfylt;
    private int ferdigUtfyltKravSuksesskriterierIkkeRelevant;

}
