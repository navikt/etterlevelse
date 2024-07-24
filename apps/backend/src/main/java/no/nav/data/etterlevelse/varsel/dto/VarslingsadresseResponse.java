package no.nav.data.etterlevelse.varsel.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.SlackChannel;
import no.nav.data.etterlevelse.varsel.domain.SlackUser;

@Data
@Builder
public class VarslingsadresseResponse {

    private String adresse;
    private AdresseType type;

    // GraphQL only
    @Schema(hidden = true)
    private SlackUser slackUser;
    @Schema(hidden = true)
    private SlackChannel slackChannel;
}
