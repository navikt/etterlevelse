package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KravRepo extends JpaRepository<GenericStorage, UUID>, KravRepoCustom {

    @Override
    @Query(value = "select * from generic_storage where type = 'Krav' order by data -> 'kravNummer', data -> 'kravVersjon'",
            countQuery = "select count(1) from generic_storage where type = 'Krav'",
            nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data ->> 'avdeling' = ?1 and type = 'Krav'", nativeQuery = true)
    List<GenericStorage> findByAvdeling(String code);

    @Query(value = "select * from generic_storage where data ->> 'underavdeling' = ?1 and type = 'Krav'", nativeQuery = true)
    List<GenericStorage> findByUnderavdeling(String code);

    @Query(value = "select * from generic_storage where data ->> 'navn' ilike %?1% and type = 'Krav'", nativeQuery = true)
    List<GenericStorage> findByNameContaining(String name);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and type = 'Krav'", nativeQuery = true)
    List<GenericStorage> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2) and type = 'Krav'", nativeQuery = true)
    Optional<GenericStorage> findByKravNummer(int nummer, int versjon);

    @Query(value = "select nextval('krav_nummer')", nativeQuery = true)
    int nextKravNummer();

    @Query(value = "select max(cast(data -> 'kravVersjon' as integer)) + 1 from generic_storage where type = 'Krav' and data -> 'kravNummer' = to_jsonb(?1)", nativeQuery = true)
    int nextKravVersjon(Integer kravNummer);

    @Query(value = "select * from generic_storage where data ->> 'kravId' = cast(?1 as text) and id = ?2 and type = 'KravImage'", nativeQuery = true)
    GenericStorage findKravImage(UUID kravId, UUID fileId);

}
