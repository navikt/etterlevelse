package no.nav.data.etterlevelse.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.krav.dto.KravResponse;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BehandlingStats {

    private List<KravResponse> fyltKrav;
    private List<KravResponse> ikkeFyltKrav;
    private List<LovStats> lovStats;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LovStats {

        private CodelistResponse lovCode;
        private List<KravResponse> fyltKrav;
        private List<KravResponse> ikkeFyltKrav;
    }
}
