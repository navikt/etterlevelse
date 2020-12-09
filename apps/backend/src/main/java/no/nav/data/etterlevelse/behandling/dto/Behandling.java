package no.nav.data.etterlevelse.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.etterlevelse.common.domain.ExternalCode;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Behandling {

    private String id;
    private String navn;
    private int nummer;

    private ExternalCode overordnetFormaal;
    private String formaal;

    private ExternalCode avdeling;
    @Singular("linje")
    private List<ExternalCode> linjer;
    @Singular("system")
    private List<ExternalCode> systemer;
    @Singular("team")
    private List<String> teams;
}
