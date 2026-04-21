package no.nav.data.etterlevelse.dashboard.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AvdelingDashBoardResponse {

    private String avdelingId;
    private String avdelingNavn;
    private DokumenterStats dokumenter;
    private SuksesskriterierStats suksesskriterier;
    private BehovForPvkStats behovForPvk;
    private PvkStats pvk;
}
