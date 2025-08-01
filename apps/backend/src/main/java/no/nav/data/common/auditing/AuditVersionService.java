package no.nav.data.common.auditing;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionCustomRepo;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.domain.MailLogRepository;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditVersionService {

    private final AuditVersionRepository repository;

    private final AuditVersionCustomRepo customRepo;

    private final StorageService<MailLog> storage;

    private final MailLogRepository mailLogRepository;


    public Page<AuditVersion> findByTable(String table, Pageable pageable) {
        return repository.findByTable(table, pageable);
    }

    public Page<AuditVersion> findByTableId(String tableId, Pageable pageable) {
        return repository.findByTableId(tableId, pageable);
    }

    public Page<AuditVersion> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public List<AuditVersion> findByTableIdOrderByTimeDesc(String id) {
        return repository.findByTableIdOrderByTimeDesc(id);
    }

    public List<AuditVersion> findByTableIdOrderByTimeDesc(UUID id) {
        return findByTableIdOrderByTimeDesc(id.toString());
    }

    public Page<GenericStorage<MailLog>> findAllMailLog(Pageable pageable) {
        return mailLogRepository.findAll(pageable);
    }

    public MailLog getMaillogById(UUID id) {
        return storage.get(id);
    }

    public List<GenericStorage<MailLog>> findMaillogByTo(String user) {
        return mailLogRepository.findByTo(user);
    }

    public List<AuditVersion> getByTableIdAndTimestamp(String tableId, String timestamp) {
        return customRepo.findLatestByTableIdAndTimeStamp(tableId, timestamp);
    }

    public List<AuditVersion> getByTableIdAndTimestamp(UUID tableId, LocalDateTime timestamp) {
        return getByTableIdAndTimestamp(tableId.toString(), timestamp.toString());
    }

    public List<AuditVersion> findLatestEtterlevelseByEtterlevelseDokumentIdAndTimestamp(String etterlevelseDokumentasjonId, String timestamp) {
        return customRepo.findLatestEtterlevelseByEtterlevelseDokumentIdAndTimestamp(etterlevelseDokumentasjonId, timestamp);
    }

    public List<AuditVersion> findLatestEtterlevelseByEtterlevelseDokumentIdAndCurrentUser(String etterlevelseDokumentasjonId) {
        return customRepo.findLatestEtterlevelseByEtterlevelseDokumentIdAndCurrentUser(etterlevelseDokumentasjonId);
    }

    public List<AuditVersion> findLatestEtterlevelseDokumentIdAndCurrentUser(String etterlevelseDokumentasjonId) {
        return customRepo.findLatestEtterlevelseDokumentIdAndCurrentUser(etterlevelseDokumentasjonId);
    }

    public List<AuditVersion> findLatestPvoTilbakemeldingIdAndCurrentUser(String pvoTilbakemeldingId) {
        return customRepo.findLatestPvoTilbakemeldingIdAndCurrentUser(pvoTilbakemeldingId);
    }
}
