package no.nav.data.etterlevelse.varsel.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @JsonIgnore
    private SlackUser slackUser;
    @JsonIgnore
    private SlackChannel SlackChannel;
}
