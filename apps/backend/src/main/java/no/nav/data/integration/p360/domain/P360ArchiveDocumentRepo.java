package no.nav.data.integration.p360.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface P360ArchiveDocumentRepo extends JpaRepository<P360ArchiveDocument, UUID>  {
    @Query(value = "select * from p360_archive_document where data ->> 'CaseNumber' = ?1", nativeQuery = true)
    P360ArchiveDocument findByCaseNumber(String caseNumber);
}