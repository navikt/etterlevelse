package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import lombok.RequiredArgsConstructor;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.SlackChannel;
import no.nav.data.etterlevelse.varsel.domain.SlackUser;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.slack.SlackClient;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VarslingsadresseFieldResolver implements GraphQLResolver<Varslingsadresse> {

    private final SlackClient slackClient;

    public SlackChannel slackChannel(Varslingsadresse varslingsadresse) {
        if (varslingsadresse.getType() == AdresseType.SLACK) {
            return slackClient.getChannel(varslingsadresse.getAdresse());
        }
        return null;
    }

    public SlackUser slackUser(Varslingsadresse varslingsadresse) {
        if (varslingsadresse.getType() == AdresseType.SLACK_USER) {
            return slackClient.getUserBySlackId(varslingsadresse.getAdresse());
        }
        return null;
    }
}
