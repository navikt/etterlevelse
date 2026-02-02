package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;


import lombok.*;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class KravTilstandHistorikk {
    private String tema;
    private int antallKravUnderArbeid;
    private int antallKravFerdigUtfylt;
    private int antallSuksesskriterieUnderArbeid;
    private int antallSuksesskriterieOppfylt;
    private int antallSuksesskriterieIkkeOppfylt;
    private int antallSuksesskriterieIkkeRelevant;
}
