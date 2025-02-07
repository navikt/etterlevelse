package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KravReference {
    private String navn;
    private Integer kravNummer;
    public Integer kravVersjon;
    public String temaCode;
}
