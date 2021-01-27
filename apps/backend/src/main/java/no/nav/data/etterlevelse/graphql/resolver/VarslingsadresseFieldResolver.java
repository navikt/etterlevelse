package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.slack.SlackClient;
import no.nav.data.integration.slack.dto.SlackDtos.Channel;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VarslingsadresseFieldResolver implements GraphQLResolver<Varslingsadresse> {

    private final SlackClient slackClient;

    public Channel slackChannel(Varslingsadresse varslingsadresse) {
        if (varslingsadresse.getType() == AdresseType.SLACK) {
            return slackClient.getChannel(varslingsadresse.getAdresse());
        }
        return null;
    }
}
