package no.nav.data.pvk.pvotilbakemelding.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface PvoTilbakemeldingRepo extends JpaRepository<PvoTilbakemelding, UUID> {
    @Query(value = "select * from pvo_tilbakemelding where pvk_dokument_id = ?1", nativeQuery = true)
    Optional<PvoTilbakemelding> findByPvkDokumentId(UUID pvkDokumentId);
}
