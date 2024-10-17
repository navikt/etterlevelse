package no.nav.data.pvk.pvkdokument.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PvkDokumentFilRepo  extends JpaRepository<PvkDokumentFil, UUID> {

    @Query(value = "select * from pvk_dokument_fil where pvk_dokument_id = ?1", nativeQuery = true)
    List<PvkDokumentFil> findPvkDokumentFilerByPvkDokumentId(String pvkDokumentId);

    @Query(value = "select * from pvk_dokument_fil where file_name = ?1", nativeQuery = true)
    Optional<PvkDokumentFil> findPvkDokumentFilerByFilename(String fileName);
}
