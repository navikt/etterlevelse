package no.nav.data.etterlevelse.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KravDashboardResponse {
    private UUID kravId;
    private String kravNavn;
    private Integer kravNummer;
    private Integer kravVersjon;

    private int etterlevelseTotal;
    private int antallUnderArbeid;
    private int antallFerdigVurdert;
    private int antallSuksesskriterierUnderArbeid;
    private int antallSuksesskriterierOppfylt;
    private int antallSuksesskriterierIkkeOppfylt;
    private int antallSuksesskriterierIkkeRelevant;

    private int antallFerdigUtfyltKravSuksesskriterierOppfylt;
    private int antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt;
    private int antallFerdigUtfyltKravSuksesskriterierIkkeRelevant;

}
