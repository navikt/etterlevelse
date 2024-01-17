package no.nav.data.etterlevelse.krav.domain;

import jakarta.transaction.Transactional;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KravRepo extends JpaRepository<GenericStorage<Krav>, UUID>, KravRepoCustom {

    @Override
    @Query(value = "select * from generic_storage where type = 'Krav' order by data -> 'kravNummer', data -> 'kravVersjon'",
            countQuery = "select count(1) from generic_storage where type = 'Krav'",
            nativeQuery = true)
    Page<GenericStorage<Krav>> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where type = 'Krav' and data ->> 'status' <> 'UTKAST' order by data -> 'kravNummer', data -> 'kravVersjon'",
            countQuery = "select count(1) from generic_storage where type = 'Krav' and data ->> 'status' <> 'UTKAST'",
            nativeQuery = true)
    Page<GenericStorage<Krav>> findAllNonUtkast(Pageable pageable);

    @Query(value = "select * from generic_storage where data ->> 'avdeling' = ?1 and type = 'Krav'", nativeQuery = true)
    List<GenericStorage<Krav>> findByAvdeling(String code);

    @Query(value = "select * from generic_storage where data ->> 'underavdeling' = ?1 and type = 'Krav'", nativeQuery = true)
    List<GenericStorage<Krav>> findByUnderavdeling(String code);

    @Query(value = "select * from generic_storage where data ->> 'navn' ilike %?1% and type = 'Krav'", nativeQuery = true)
    List<GenericStorage<Krav>> findByNameContaining(String name);

    @Query(value = "select * from generic_storage where data ->> 'kravNummer' ilike %?1% and type = 'Krav'", nativeQuery = true)
    List<GenericStorage<Krav>> findByNumberContaining(String number);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and type = 'Krav'", nativeQuery = true)
    List<GenericStorage<Krav>> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2) and type = 'Krav'", nativeQuery = true)
    Optional<GenericStorage<Krav>> findByKravNummer(int nummer, int versjon);

    @Query(value = "select nextval('krav_nummer')", nativeQuery = true)
    int nextKravNummer();

    @Query(value = "select max(cast(data -> 'kravVersjon' as integer)) + 1 from generic_storage where type = 'Krav' and data -> 'kravNummer' = to_jsonb(?1)", nativeQuery = true)
    int nextKravVersjon(Integer kravNummer);

    @Query(value = "select * from generic_storage where data ->> 'kravId' = cast(?1 as text) and id = ?2 and type = 'KravImage'", nativeQuery = true)
    GenericStorage<KravImage> findKravImage(UUID kravId, UUID fileId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "update generic_storage set data = jsonb_set(DATA, '{status}', '\"UTGAATT\"', false ) where data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2) and type = 'Krav' ", nativeQuery = true)
    void updateKravToUtgaatt(int kravNummer, int kravVersjon);

    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = """
            delete from generic_storage image 
              where type = 'KravImage'
              and last_modified_date < now() at time zone 'Europe/Oslo' - interval '60 minute'
              and not exists (
              select 1 from generic_storage krav 
                where krav.type = 'Krav' 
                and cast(krav.id as text) = image.data ->> 'kravId'
                and jsonb_path_exists(krav.data, cast('$.** ? (@.type() == "string" && @ like_regex "' || image.id || '")' as jsonpath))
            )""")
    int cleanupImages();

}
