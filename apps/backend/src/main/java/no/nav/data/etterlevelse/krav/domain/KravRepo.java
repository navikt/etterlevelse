package no.nav.data.etterlevelse.krav.domain;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KravRepo extends JpaRepository<Krav, UUID>, KravRepoCustom {

    @Override
    @Query(value = "select * from krav order by krav_nummer, krav_versjon",
            countQuery = "select count(1) from krav",
            nativeQuery = true)
    Page<Krav> findAll(Pageable pageable);

    @Query(value = "select * from krav where data ->> 'status' <> 'UTKAST' order by krav_nummer, krav_versjon",
            countQuery = "select count(1) from krav where data ->> 'status' <> 'UTKAST'",
            nativeQuery = true)
    Page<Krav> findAllNonUtkast(Pageable pageable);

    @Query(value = "select * from krav where data ->> 'avdeling' = ?1", nativeQuery = true)
    List<Krav> findByAvdeling(String code);

    @Query(value = "select * from krav where data ->> 'underavdeling' = ?1", nativeQuery = true)
    List<Krav> findByUnderavdeling(String code);

    @Query(value = "select * from krav where data ->> 'navn' ilike %?1%", nativeQuery = true)
    List<Krav> findByNavnContaining(String name);

    @Query(value = "select * from krav where cast(krav_nummer as text) ilike %?1%", nativeQuery = true)
    List<Krav> findByKravNummerContaining(String number);

    List<Krav> findByKravNummer(int kravNummer);

    @Query(value = "select * from krav where krav_nummer = ?1 and data ->> 'status' = 'AKTIV'", nativeQuery = true)
    List<Krav> findByKravNummerAndAktiveStatus(int kravNummer);

    Optional<Krav> findByKravNummerAndKravVersjon(int kravNummer, int kravVersjon);

    @Query(value = "select nextval('krav_nummer')", nativeQuery = true)
    int nextKravNummer();

    @Query(value = "select max(krav_versjon) + 1 from krav where krav_nummer = ?1", nativeQuery = true)
    int nextKravVersjon(Integer kravNummer);

    @Query(value = "select * from generic_storage where data ->> 'kravId' = cast(?1 as text) and id = ?2 and type = 'KravImage'", nativeQuery = true)
    GenericStorage<KravImage> findKravImage(UUID kravId, UUID fileId);

    @Modifying(clearAutomatically = true)
    @Transactional(propagation = Propagation.MANDATORY)
    @Query(value = "update krav set data = jsonb_set(DATA, '{status}', '\"UTGAATT\"', false ) where krav_nummer = ?1 kravVersjon = ?2", nativeQuery = true)
    void updateKravToUtgaatt(int kravNummer, int kravVersjon);

    @Modifying
    @Transactional(propagation = Propagation.MANDATORY)
    @Query(nativeQuery = true, value = """
            delete from generic_storage image 
            where type = 'KravImage'
              and last_modified_date < now() at time zone 'Europe/Oslo' - interval '60 minute'
              and not exists (
                select 1 from krav 
                where cast(krav.id as text) = image.data ->> 'kravId'
                  and jsonb_path_exists(krav.data, cast('$.** ? (@.type() == "string" && @ like_regex "' || image.id || '")' as jsonpath))
            )""")
    int cleanupImages();

}
