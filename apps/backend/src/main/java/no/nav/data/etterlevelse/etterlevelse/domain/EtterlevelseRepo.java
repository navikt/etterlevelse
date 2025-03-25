package no.nav.data.etterlevelse.etterlevelse.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EtterlevelseRepo extends JpaRepository<Etterlevelse, UUID> {

    @Override
    @Query(value = "select * from etterlevelse",
            countQuery = "select count(1) from etterlevelse",
            nativeQuery = true)
    Page<Etterlevelse> findAll(Pageable pageable);

    @Query(value = "select * from etterlevelse where krav_nummer = ?1", nativeQuery = true)
    List<Etterlevelse> findByKravNummer(int nummer);

    @Query(value = "select * from etterlevelse where krav_nummer = ?1 and krav_versjon = ?2", nativeQuery = true)
    List<Etterlevelse> findByKravNummer(int nummer, int versjon);

    @Query(value = "select * from etterlevelse where etterlevelse_dokumentasjon_id = ?1", nativeQuery = true)
    List<Etterlevelse> findByEtterlevelseDokumensjon(UUID etterlevelseDokumentasjonId);

    @Query(value = "select * from etterlevelse where etterlevelse_dokumentasjon_id in ?1", nativeQuery = true)
    List<Etterlevelse> findByEtterlevelseDokumentasjoner(List<UUID> etterlevelseDokumentasjonIds);

    @Query(value = "select * from etterlevelse where etterlevelse_dokumentasjon_id = ?1 and krav_nummer = ?2", nativeQuery = true)
    List<Etterlevelse> findByEtterlevelseDokumentasjonIdAndKravNummer(UUID etterlevelseDokumentasjonId, int nummer);

    @Query(value = "select * from etterlevelse where etterlevelse_dokumentasjon_id = ?1 and krav_nummer = ?2 and krav_versjon = ?3", nativeQuery = true)
    Optional<Etterlevelse> findByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(UUID etterlevelseDokumentasjonId, int nummer, int versjon);

}
