package no.nav.data.etterlevelse.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PvkStats {
    private int total;
    private int ikkePaabegynt;
    private int underArbeid;
    private int tilBehandlingHosPvo;
    private int tilbakemeldingFraPvo;
    private int godkjentAvRisikoeier;
    private int pvkIWord;
}
