package no.nav.data.pvk.pvkdokument.domain;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PvkDokumentVersionRepo extends JpaRepository<PvkDokumentVersion, UUID> {

    List<PvkDokumentVersion> findByPvkDokumentIdOrderByCreatedDateDesc(UUID pvkDokumentId);

    List<PvkDokumentVersion> findByEtterlevelseDokumentIdOrderByCreatedDateDesc(UUID etterlevelseDokumentId);
}
