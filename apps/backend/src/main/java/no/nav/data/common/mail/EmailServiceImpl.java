package no.nav.data.common.mail;

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.StorageService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final StorageService<MailTask> storage;
    private final EmailProvider emailProvider;
    private final SecurityProperties securityProperties;

    public EmailServiceImpl(StorageService<MailTask> storage, EmailProvider emailProvider, SecurityProperties securityProperties) {
        this.storage = storage;
        this.emailProvider = emailProvider;
        this.securityProperties = securityProperties;
    }

    @Override
    public void sendMail(MailTask mailTask) {
        var toSend = securityProperties.isDev() ? mailTask.withSubject("[DEV] " + mailTask.getSubject()) : mailTask;
        emailProvider.sendMail(toSend);
    }

    @Override
    public void scheduleMail(MailTask mailTask) {
        storage.save(mailTask);
    }

    @SchedulerLock(name = "sendMail")
    @Scheduled(initialDelayString = "PT2M", fixedRateString = "PT1M")
    public void sendMail() {
        var tasks = storage.getAll(MailTask.class);

        tasks.forEach(task -> {
            sendMail(task);
            storage.delete(task);
        });
    }
}
