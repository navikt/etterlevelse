package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.krav.dto.KravResponse;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EtterlevelseDokumentasjonStats {

    @Singular("fylt")
    private List<KravResponse> fyltKrav;
    @Singular("ikkeFylt")
    private List<KravResponse> ikkeFyltKrav;
    @Singular("irrelevant")
    private List<KravResponse> irrelevantKrav;
    @Singular
    private List<LovStats> lovStats;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LovStats {

        private CodelistResponse lovCode;
        @Singular("fylt")
        private List<KravResponse> fyltKrav;
        @Singular("ikkeFylt")
        private List<KravResponse> ikkeFyltKrav;
        @Singular("irrelevant")
        private List<KravResponse> irrelevantKrav;
    }

    public static EtterlevelseDokumentasjonStats empty() {
        return EtterlevelseDokumentasjonStats.builder().build();
    }
}
