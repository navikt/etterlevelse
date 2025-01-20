package no.nav.data.pvk.tiltak.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;


public interface TiltakRepo extends JpaRepository<Tiltak, UUID> {

    @Query(value = "select * from tiltak where pvk_dokument_id = ?1", nativeQuery = true)
    List<Tiltak> findByPvkDokumentId(String pvkDokumentId);

}