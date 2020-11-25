package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface KravRepo extends JpaRepository<GenericStorage, UUID> {

    @Override
    @Query(value = "select * from generic_storage where type = 'Krav' order by data -> 'kravNummer', data -> 'kravVersjon'",
            countQuery = "select count(1) from generic_storage where type = 'Krav'",
            nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data ->> 'relevansFor' = ?1 and type = 'Krav'", nativeQuery = true)
    List<GenericStorage> findByRelevans(String code);

    @Query(value = "select * from generic_storage where data ->> 'name' ilike %?1% and type = 'Krav'", nativeQuery = true)
    List<GenericStorage> findByNameContaining(String name);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1)", nativeQuery = true)
    List<GenericStorage> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2)", nativeQuery = true)
    GenericStorage findByKravNummer(int nummer, int versjon);

    @Query(value = "select nextval('krav_nummer')", nativeQuery = true)
    int nextKravNummer();

    @Query(value = "select max(cast(data -> 'kravVersjon' as integer)) + 1 from generic_storage where type = 'Krav' and data -> 'kravNummer' = to_jsonb(?1)", nativeQuery = true)
    int nextKravVersjon(Integer kravNummer);
}
