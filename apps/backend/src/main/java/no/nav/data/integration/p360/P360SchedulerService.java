package no.nav.data.integration.p360;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.integration.p360.domain.P360ArchiveDocument;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class P360SchedulerService {
    private final P360Service p360Service;

    @SchedulerLock(name = "sendP360ArchiveDocuments")
    @Scheduled(initialDelayString = "PT2M", fixedRateString = "PT1M")
    public void sendP360ArchiveDocuments() {
        List<P360ArchiveDocument> tasks = p360Service.getAllP360ArchiveDocuments();
        tasks.forEach(this::sendP360ArchiveDocumentAndDelete);

    }

    @Transactional
    protected void sendP360ArchiveDocumentAndDelete(P360ArchiveDocument archiveDocument) {
        p360Service.delete(archiveDocument.getId());
        p360Service.createDocument(archiveDocument.getData());
    }
}