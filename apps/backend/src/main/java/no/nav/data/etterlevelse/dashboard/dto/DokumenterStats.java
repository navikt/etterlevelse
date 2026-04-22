package no.nav.data.etterlevelse.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DokumenterStats {
    private int total;
    private int underArbeid;
    private int sendtTilGodkjenning;
    private int godkjentAvRisikoeier;
}

