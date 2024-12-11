package no.nav.data.etterlevelse.varsel;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.mail.EmailService;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.slack.SlackMelding;
import no.nav.data.integration.slack.SlackService;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VarselService {
    
    private final EmailService emailService;
    private final SlackService slackService;
    private final SecurityProperties securityProperties;

    public void varsle(List<Varslingsadresse> recipients, Varsel varsel) {
        for (Varslingsadresse varslingsadresse : recipients) {
            switch (varslingsadresse.getType()) {
                case EPOST -> emailService.scheduleMail(MailTask.builder().to(varslingsadresse.getAdresse()).subject(varsel.getTitle()).body(varsel.toHtml()).build());
                case SLACK -> slackService.sendMessageToChannel(varslingsadresse.getAdresse(), varsel.toSlack(), SlackMelding.PRIORITY_LOW);
                case SLACK_USER -> {
                    if (securityProperties.isDev()) {
                        slackService.sendMessageToChannel(varslingsadresse.getAdresse(), varsel.toSlack(), SlackMelding.PRIORITY_LOW);
                    } else {
                        slackService.sendMessageToUser(varslingsadresse.getAdresse(), varsel.toSlack(), SlackMelding.PRIORITY_LOW);
                    }
                }
                default -> throw new NotImplementedException("%s is not an implemented varsel type".formatted(varslingsadresse.getType()));
            }
        };
        
    }
    
}
