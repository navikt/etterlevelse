package no.nav.data.etterlevelse.varsel;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.NotImplementedException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.mail.EmailService;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.slack.SlackMeldingData;
import no.nav.data.integration.slack.SlackMeldingData.MeldingPart;
import no.nav.data.integration.slack.SlackService;

@Service
@RequiredArgsConstructor
public class VarselService {
    
    private final EmailService emailService;
    private final SlackService slackService;
    private final SecurityProperties securityProperties;

    public void varsle(List<Varslingsadresse> recipients, Varsel varsel) {
        varsle(recipients, varsel, null);
    }

    public void varsle(List<Varslingsadresse> recipients, Varsel varsel, String etterlevelseDokumentasjonId) {
        for (Varslingsadresse varslingsadresse : recipients) {
            switch (varslingsadresse.getType()) {
                case EPOST -> emailService.scheduleMail(MailTask.builder().to(varslingsadresse.getAdresse()).subject(varsel.getTitle()).body(varsel.toHtml()).etterlevelseDokumentasjonId(etterlevelseDokumentasjonId).build());
                case SLACK -> slackService.scheduleSlack(createSlackMeldingData(varsel, varslingsadresse.getAdresse(), true, SlackMeldingData.PRIORITY_LOW, etterlevelseDokumentasjonId));
                case SLACK_USER -> slackService.scheduleSlack(createSlackMeldingData(varsel, varslingsadresse.getAdresse(), securityProperties.isDev(), SlackMeldingData.PRIORITY_LOW, etterlevelseDokumentasjonId));
                default -> throw new NotImplementedException("%s is not an implemented varsel type".formatted(varslingsadresse.getType()));
            }
        };
        
    }
    
    private SlackMeldingData createSlackMeldingData(Varsel varsel, String mottager, boolean sendTilKanal, int priority, String etterlevelseDokumentasjonId) {
        List<MeldingPart> parts = new ArrayList<>();
        parts.add(MeldingPart.header(varsel.getTitle()));
        varsel.getParagraphs().forEach(p -> parts.add(MeldingPart.text(p.toSlack())));

        return SlackMeldingData.builder()
                .mottager(mottager)
                .prioritet(priority)
                .sendTilKanal(sendTilKanal)
                .parts(parts)
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .build();
    }
    
}
