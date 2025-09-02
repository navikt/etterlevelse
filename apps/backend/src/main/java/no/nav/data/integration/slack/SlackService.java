package no.nav.data.integration.slack;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlackService {
    
    private final SlackMeldingRepo repo;
    private final SlackClient slackClient;

    @Transactional(propagation = Propagation.REQUIRED)
    public void scheduleSlack(SlackMeldingData melding) {
        SlackMelding sm =  SlackMelding.builder().data(melding).build();
        repo.save(sm);
    }

    // @Scheduled(cron = "0 55 12 * * *") // Happens every day at 12:55:00
    @SchedulerLock(name = "sendSlackEnGros")
    @Scheduled(cron = "10 * * * * *") // Happens every minute (10 seconds past every minute)
    public void sendAll() {
        log.info("Sending all pending slack messages...");
        int sendCount = 0;
        while (sendOneMessage(SlackMeldingData.PRIORITY_LOW)) {
            sendCount++;
        }
        log.info("Done sending {} pending slack messages", sendCount);
    }

    @SchedulerLock(name = "sendSlackPriority")
    @Scheduled(cron = "10 * * * * *") // Happens every minute (10 seconds past every minute)
    public void sendHighPriority() {
        int sendCount = 0;
        while (sendOneMessage(SlackMeldingData.PRIORITY_HIGH)) {
            sendCount++;
        }
        if (sendCount > 0) {
            log.info("Done sending {} high priority slack messages", sendCount);
        }
    }

    // Returns true if there was a pending message to send, false otherwise.
    @Transactional
    boolean sendOneMessage(int priority) {
        SlackMelding sm = repo.getOneWithPriority(priority).orElse(null);
        if (sm == null) return false;

        try {
            // We delete first, then try to send
            // - If the delete fails, message is not sent
            // - If the send fails with RuntimeException, deletion is rolled back (default behaviour of @Transactional)
            // - However, if parts of the message is sent before another part triggers an exception, the result is repeat dispatching of the parts already sent
            repo.delete(sm);
            if (sm.getSendTilKanal()) {
                slackClient.sendMessageToChannel(sm.getMottager(), sm.getParts());
            } else {
                slackClient.sendMessageToUserId(sm.getMottager(), sm.getParts());
            }
            return true;
        } catch (RuntimeException e) {
            log.error("Exception caught while trying to send slack message (may cause hickup/re-sending of message parts)", e);
            throw new RuntimeException("Exception caught while trying to send slack message (may cause hickup/re-sending of message parts)" , e);
        }
    }
    
}
