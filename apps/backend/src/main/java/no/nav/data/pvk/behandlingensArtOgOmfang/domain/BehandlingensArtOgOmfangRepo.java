package no.nav.data.pvk.behandlingensArtOgOmfang.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface BehandlingensArtOgOmfangRepo extends JpaRepository<BehandlingensArtOgOmfang, UUID> {

    @Override
    @Query(value = "select * from BEHANDLINGENS_ART_OG_OMFANG",
            countQuery = "select count(1) from pvk_dokument",
            nativeQuery = true)
    Page<BehandlingensArtOgOmfang> findAll(Pageable pageable);


    @Query(value = "select * from BEHANDLINGENS_ART_OG_OMFANG where etterlevelse_dokumentasjon_id = ?1", nativeQuery = true)
    Optional<BehandlingensArtOgOmfang> findByEtterlevelseDokumensjon(UUID etterlevelseDokumentasjonId);
}
