package no.nav.data.pvk.pvkdokument.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface PvkDokumentRepo extends JpaRepository<PvkDokument, UUID> {

    @Override
    @Query(value = "select * from pvk_dokument",
            countQuery = "select count(1) from pvk_dokument",
            nativeQuery = true)
    Page<PvkDokument> findAll(Pageable pageable);


    @Query(value = "select * from pvk_dokument where etterlevelse_dokumentasjon_id = ?1", nativeQuery = true)
    Optional<PvkDokument> findByEtterlevelseDokumensjon(String etterlevelseDokumentasjonId);


}
