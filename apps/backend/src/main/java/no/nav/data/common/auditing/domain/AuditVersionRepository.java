package no.nav.data.common.auditing.domain;

import no.nav.data.common.auditing.dto.AuditMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditVersionRepository extends JpaRepository<AuditVersion, UUID> {

    Page<AuditVersion> findByTable(String table, Pageable pageable);

    List<AuditVersion> findByTableIdOrderByTimeDesc(String tableId);

    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version where audit_id in ?1", nativeQuery = true)
    List<AuditMetadata> getMetadataByIds(List<UUID> uuids);

    @Query(value = "select cast(audit_id as text) from audit_version "
            + "where table_id = (select table_id from audit_version where audit_id = ?1) "
            + "and time < (select time from audit_version where audit_id = ?1) "
            + "order by time desc limit 1", nativeQuery = true)
    String getPreviousAuditIdFor(UUID id);

    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version "
            + "where table_id = cast(?1 as text) order by time desc limit 1", nativeQuery = true)
    AuditMetadata lastAuditForObject(UUID uuid);

}
