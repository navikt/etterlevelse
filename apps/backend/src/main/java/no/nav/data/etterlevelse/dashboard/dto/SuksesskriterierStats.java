package no.nav.data.etterlevelse.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SuksesskriterierStats {
    private int underArbeidProsent;
    private int oppfyltProsent;
    private int ikkeOppfyltProsent;
    private int ikkeRelevantProsent;
}
