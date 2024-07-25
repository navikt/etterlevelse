package no.nav.data.etterlevelse.varsel.dto;

import lombok.Builder;
import lombok.Data;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.SlackChannel;
import no.nav.data.etterlevelse.varsel.domain.SlackUser;

@Data
@Builder
public class VarslingsadresseGraphQlResponse {

    private String adresse;
    private AdresseType type;
    private SlackUser slackUser;
    private SlackChannel slackChannel;
}
