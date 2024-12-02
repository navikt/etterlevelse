package no.nav.data.pvk.risikoscenario.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KravShort {
    private String navn;
    private Integer kravNummer;
    public Integer kravVersjon;
}
