package no.nav.data.etterlevelse.krav.domain;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KravReference {
    private String navn;
    private Integer kravNummer;
    public Integer kravVersjon;
}
