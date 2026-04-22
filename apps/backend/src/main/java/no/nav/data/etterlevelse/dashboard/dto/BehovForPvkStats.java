package no.nav.data.etterlevelse.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BehovForPvkStats {
    private int totalMedPersonopplysninger;
    private int ikkeVurdertBehov;
    private int vurdertIkkeBehov;
    private int behovIkkePaabegynt;
}
