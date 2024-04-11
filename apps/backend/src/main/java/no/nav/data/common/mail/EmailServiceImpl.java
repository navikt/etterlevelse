package no.nav.data.common.mail;

import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.StorageService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final StorageService<MailTask> storage;
    private final EmailProvider emailProvider;
    private final SecurityProperties securityProperties;

    @Override
    public void sendMail(MailTask mailTask) {
        var toSend = securityProperties.isDev() ? mailTask.withSubject("[DEV] " + mailTask.getSubject()) : mailTask;
        emailProvider.sendMail(toSend);
    }

    @Override
    @Transactional
    public void scheduleMail(MailTask mailTask) {
        storage.save(mailTask);
    }

    @SchedulerLock(name = "sendMail")
    @Scheduled(initialDelayString = "PT2M", fixedRateString = "PT1M")
    public void sendMail() {
        var tasks = storage.getAll(MailTask.class);
        tasks.forEach(this::sendMailAndDelete);
    }
    
    @Transactional
    protected void sendMailAndDelete(MailTask task) {
        sendMail(task);
        storage.delete(task);
    }
    
}
