package no.nav.data.etterlevelse.statistikk.dto;

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

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DokumenterStats {
        private int total;
        private int ikkePaabegynt;
        private int underArbeid;
        private int godkjentAvRisikoeier;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SuksesskriterierStats {
        private int underArbeidProsent;
        private int oppfyltProsent;
        private int ikkeOppfyltProsent;
        private int ikkeRelevantProsent;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BehovForPvkStats {
        private int totalMedPersonopplysninger;
        private int ikkeVurdertBehov;
        private int vurdertIkkeBehov;
        private int behovIkkePaabegynt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PvkStats {
        private int total;
        private int underArbeid;
        private int tilBehandlingHosPvo;
        private int tilbakemeldingFraPvo;
        private int godkjentAvRisikoeier;
        private int pvkIWord;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SeksjonOption {
        private String id;
        private String navn;
    }
}
