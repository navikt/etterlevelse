package no.nav.data.etterlevelse.graphql.controller;


import lombok.RequiredArgsConstructor;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.SlackChannel;
import no.nav.data.etterlevelse.varsel.domain.SlackUser;
import no.nav.data.etterlevelse.varsel.dto.VarslingsadresseResponse;
import no.nav.data.integration.slack.SlackClient;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@SchemaMapping(typeName = "Varslingsadresse")
public class VarslingsadresseGraphQlController {

    private final SlackClient slackClient;

    @SchemaMapping(field = "slackChannel")
    public SlackChannel slackChannel(VarslingsadresseResponse varslingsadresse) {
        if (varslingsadresse.getType() == AdresseType.SLACK) {
            return slackClient.getChannel(varslingsadresse.getAdresse());
        }
        return null;
    }

    @SchemaMapping(field = "slackUser")
    public SlackUser slackUser(VarslingsadresseResponse varslingsadresse) {
        if (varslingsadresse.getType() == AdresseType.SLACK_USER) {
            return slackClient.getUserBySlackId(varslingsadresse.getAdresse());
        }
        return null;
    }
}
