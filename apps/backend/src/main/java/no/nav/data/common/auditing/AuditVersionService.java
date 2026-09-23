package no.nav.data.common.auditing;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionCustomRepo;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.domain.MailLogRepository;
import no.nav.data.common.auditing.domain.SearchTypes;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.domain.Krav;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

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

    public Page<AuditVersion> findByAction(String action, Pageable pageable) {
        return repository.findByAction(Enum.valueOf(Action.class, action), pageable);
    }

    public Page<AuditVersion> findByTableAndAction(String table, String action, Pageable pageable) {
        return repository.findByTableAndAction(table, Enum.valueOf(Action.class, action), pageable);
    }

    public Page<AuditVersion> findByTableId(String tableId, Pageable pageable) {
        return repository.findByTableId(tableId, pageable);
    }

    public List<AuditVersion> getByTableAndSearch(SearchTypes table, String search) {
        List<AuditVersion> distinctData = repository.getByTable(table.name());

        if (table == SearchTypes.KRAV) {
           return distinctData.stream().filter(auditVersion -> {
               Krav data = JsonUtils.toObject(auditVersion.getData(), Krav.class);
               String kravNavn = "K" + data.getKravNummer() + "." + data.getKravVersjon() + " " + data.getNavn();
               return kravNavn.toLowerCase().contains(search.toLowerCase());
           }).toList();
        } else if (table == SearchTypes.ETTERLEVELSE_DOKUMENTASJON) {
            return distinctData.stream().filter(auditVersion -> {
                EtterlevelseDokumentasjon data = JsonUtils.toObject(auditVersion.getData(), EtterlevelseDokumentasjon.class);
                String eDokNavn = "E" + data.getEtterlevelseNummer() + "." + data.getEtterlevelseDokumentVersjon() + " " + data.getTitle();
                return eDokNavn.toLowerCase().contains(search.toLowerCase());
            }).toList();
        } else if (table == SearchTypes.Krav) {
            return distinctData.stream().filter(auditVersion -> {
                JsonNode data = JsonUtils.toJsonNode(auditVersion.getData());
                String kravOldNavn = "K" + data.get("data").get("kravNummer") + "." + data.get("data").get("kravVersjon") + " " + data.get("data").get("navn");
                return kravOldNavn.toLowerCase().contains(search.toLowerCase());
            }).toList();
        } else {
            return distinctData.stream().filter(auditVersion -> {
                JsonNode data = JsonUtils.toJsonNode(auditVersion.getData());
                String eDokOldNavn = "E" + data.get("data").get("etterlevelseNummer") + " " + data.get("data").get("title");
                return eDokOldNavn.toLowerCase().contains(search.toLowerCase());
            }).toList();
        }
    }

    public Page<AuditVersion> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public List<AuditVersion> findByTableIdOrderByTimeDesc(String id) {
        return repository.findByTableIdOrderByTimeDesc(id);
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

    public List<AuditVersion> getByTableIdAndTimestamp(String tableId, LocalDateTime timestamp) {
        return customRepo.findLatestByTableIdAndTimeStamp(tableId, timestamp);
    }

    public List<AuditVersion> getByTableIdAndTimestamp(UUID tableId, LocalDateTime timestamp) {
        return getByTableIdAndTimestamp(tableId.toString(), timestamp);
    }

    public List<AuditVersion> findLatestEtterlevelseByEtterlevelseDokumentIdAndTimestamp(String etterlevelseDokumentasjonId, LocalDateTime timestamp) {
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

    public List<AuditVersion> findByTableNameAndFieldNameAndFieldValueAndTimestamp(String tableName, String fieldName, String fieldValue, LocalDateTime timestamp) {
        return customRepo.findByTableNameAndFieldNameAndFieldValueAndTimestamp(tableName, fieldName, fieldValue, timestamp);
    }
}
