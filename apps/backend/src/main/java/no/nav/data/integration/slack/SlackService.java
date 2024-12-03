package no.nav.data.integration.slack;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.integration.slack.dto.SlackDtos.PostMessageRequest.Block;
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
    public void sendMessageToChannel(String mottager, List<Block> blocks) {
        SlackMelding sm = new SlackMelding(mottager, false, blocks);
        repo.save(sm);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void sendMessageToUser(String mottager, List<Block> blocks) {
        SlackMelding sm = new SlackMelding(mottager, true, blocks);
        repo.save(sm);
    }
    
    @SchedulerLock(name = "sendSlack")
    @Scheduled(cron = "0 0 13 * * *") // Happens every day at 1300
    public void sendAll() {
        log.info("Sending all pending slack messages...");
        int sendCount = 0;
        while (repo.count() > 0) {
            sendOneMessage();
            sendCount++;
        }
        log.info("Done sending {} pending slack messages", sendCount);
    }

    @Transactional()
    private void sendOneMessage() {
        SlackMelding sm = repo.getOne();
        if (sm.getSendTilKanal()) {
            slackClient.sendMessageToChannel(sm.getMottager(), sm.getBlocks());
        } else {
            slackClient.sendMessageToUserId(sm.getMottager(), sm.getBlocks());
        }
        repo.delete(sm);
    }
    
}
