package no.nav.data.integration.slack;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.integration.slack.dto.SlackDtos.Block;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlackService {
    
    private final SlackMeldingRepo repo;
    private final SlackClient slackClient;

    @Transactional(propagation = Propagation.REQUIRED)
    public void sendMessageToChannel(String mottager, List<Block> blocks, int priority) {
        SlackMelding sm = new SlackMelding(mottager, false, priority, blocks);
        repo.save(sm);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void sendMessageToUser(String mottager, List<Block> blocks, int priority) {
        SlackMelding sm = new SlackMelding(mottager, true, priority, blocks);
        repo.save(sm);
    }
    
    @SchedulerLock(name = "sendSlackEnGros")
    @Scheduled(cron = "0 55 12 * * *") // Happens every day at 12:55:00
    public void sendAll() {
        log.info("Sending all pending slack messages...");
        int sendCount = 0;
        while (sendOneMessage(SlackMelding.PRIORITY_LOW)) {
            sendCount++;
        }
        log.info("Done sending {} pending slack messages", sendCount);
    }

    @SchedulerLock(name = "sendSlackPriority")
    @Scheduled(cron = "10 * * * * *") // Happens every minute at 10 seconds.
    public void sendHighPriority() {
        int sendCount = 0;
        while (sendOneMessage(SlackMelding.PRIORITY_HIGH)) {
            sendCount++;
        }
        log.info("Done sending {} high priority slack messages", sendCount);
    }

    @Transactional()
    // Returns true if there was a pending message to send, false otherwise.
    private boolean sendOneMessage(int priority) {
        SlackMelding sm = repo.getOneWithPriority(priority).orElse(null);
        if (sm == null) return false;
        if (sm.getSendTilKanal()) {
            slackClient.sendMessageToChannel(sm.getMottager(), sm.getBlocks());
        } else {
            slackClient.sendMessageToUserId(sm.getMottager(), sm.getBlocks());
        }
        repo.delete(sm);
        return true;
    }
    
}
