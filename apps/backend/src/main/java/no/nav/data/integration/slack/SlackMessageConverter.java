package no.nav.data.integration.slack;

import no.nav.data.common.security.SecurityProperties;
import org.springframework.stereotype.Component;

@Component
public class SlackMessageConverter {

    private final SlackClient slackClient;
    private final boolean dev;

    public SlackMessageConverter(SlackClient slackClient, SecurityProperties securityProperties) {
        this.slackClient = slackClient;
        dev = securityProperties.isDev();
    }



}
