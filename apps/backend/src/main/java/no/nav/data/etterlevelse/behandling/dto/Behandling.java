package no.nav.data.etterlevelse.behandling.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.etterlevelse.behandling.domain.BehandlingData;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.common.domain.ExternalCode;
import no.nav.data.integration.team.dto.TeamResponse;

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

    @Singular("relevansForSingle")
    private List<CodelistResponse> irrelevansFor;

    @JsonIgnore
    private BehandlingData behandlingData;
    @JsonIgnore
    private List<TeamResponse> teamsData;
    @JsonIgnore
    private BehandlingStats stats;

    public void includeData(BehandlingData bd) {
        behandlingData = bd;
        setIrrelevansFor(behandlingData.irrelevantForAsCodes());
    }
}
