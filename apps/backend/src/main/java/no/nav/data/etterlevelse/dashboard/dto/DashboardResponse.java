package no.nav.data.etterlevelse.dashboard.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private String avdelingId;
    private String avdelingNavn;
    private DokumenterStats dokumenter;
    private SuksesskriterierStats suksesskriterier;
    private BehovForPvkStats behovForPvk;
    private PvkStats pvk;
    private List<SeksjonOption> seksjoner;
    private Map<String, DashboardResponse> statsBySeksjon;

}
