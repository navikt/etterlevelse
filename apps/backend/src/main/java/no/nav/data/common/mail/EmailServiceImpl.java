package no.nav.data.common.mail;

import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.StorageService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final StorageService storage;
    private final EmailProvider emailProvider;
    private final SecurityProperties securityProperties;

    public EmailServiceImpl(StorageService storage, EmailProvider emailProvider,
            SecurityProperties securityProperties) {
        this.storage = storage;
        this.emailProvider = emailProvider;
        this.securityProperties = securityProperties;
    }

    @Override
    public void sendMail(MailTask mailTask) {
        var toSend = securityProperties.isDev() ? mailTask.withSubject(mailTask.getSubject() + " [DEV]") : mailTask;
        emailProvider.sendMail(toSend);
    }

    @Override
    public void scheduleMail(MailTask mailTask) {
        storage.save(mailTask);
    }

    @Scheduled(initialDelayString = "PT3M", fixedRateString = "PT5M")
    public void sendMails() {
        var tasks = storage.getAll(MailTask.class);

        tasks.forEach(task -> {
            sendMail(task);
            storage.delete(task);
        });
    }
}
