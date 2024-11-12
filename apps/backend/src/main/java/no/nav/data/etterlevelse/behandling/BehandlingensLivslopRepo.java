package no.nav.data.etterlevelse.behandling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BehandlingensLivslopRepo extends JpaRepository<BehandlingensLivslop, UUID> {

    @Query(value = "select * from pvk_dokument_fil where pvk_dokument_id = ?1", nativeQuery = true)
    List<BehandlingensLivslop> findPvkDokumentFilerByPvkDokumentId(String pvkDokumentId);

    @Query(value = "select * from pvk_dokument_fil where file_name = ?1 and file_type = ?2", nativeQuery = true)
    Optional<BehandlingensLivslop> findPvkDokumentFilerByFilenameAndType(String fileName, String fileType);
}
