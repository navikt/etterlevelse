package no.nav.data.integration.behandling.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
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
    private String ytterligereBeskrivelse;
    private List<BkatLegalBasis> behandlingensgrunnlag;

    private boolean behandlingInnfortINav;
    private Boolean brukerAlleOpplysningstyper;

    private String gyldigFra;
    private String gyldingTil;

    private ExternalCode avdeling;
    @Singular("linje")
    private List<ExternalCode> linjer;
    @Singular("system")
    private List<ExternalCode> systemer;
    @Singular("team")
    private List<String> teams;
    @JsonIgnore
    private List<TeamResponse> teamsData;

    private List<PolicyResponse> policies;
    private List<DataBehandler> dataBehandlerList;

    private Boolean automatiskBehandling;
    private Boolean profilering;

    private Boolean kiBenyttesIBehandling;
    private Boolean personopplysningerBruktTilUtviklingAvKiSystemer;
}
