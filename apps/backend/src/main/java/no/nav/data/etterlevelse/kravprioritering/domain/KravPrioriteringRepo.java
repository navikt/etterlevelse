package no.nav.data.etterlevelse.kravprioritering.domain;

import jakarta.transaction.Transactional;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface KravPrioriteringRepo extends JpaRepository<GenericStorage<KravPrioritering>, UUID> {

    @Override
    @Query(value = "select * from generic_storage where type = 'KravPrioritering' order by data -> 'kravNummer', data -> 'kravVersjon'",
            countQuery = "select count(1) from generic_storage where type = 'KravPrioritering'",
            nativeQuery = true)
    Page<GenericStorage<KravPrioritering>> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and type = 'KravPrioritering'", nativeQuery = true)
    List<GenericStorage<KravPrioritering>> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2) and type = 'KravPrioritering'", nativeQuery = true)
    List<GenericStorage<KravPrioritering>> findByKravNummer(int nummer, int versjon);

    @Query(value = "select * from generic_storage where data ->> 'prioriteringsId' ilike %?1% and type = 'KravPrioritering'", nativeQuery = true)
    List<GenericStorage<KravPrioritering>> findByTema(String tema);

    @Query(value = "select * from generic_storage where type = 'KravPrioritering'", nativeQuery = true)
    List<GenericStorage<KravPrioritering>> getAll();

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "update generic_storage set DATA = jsonb_set(DATA, '{kravVersjon}', to_jsonb(?1) , false ) where data -> 'kravNummer' = to_jsonb(?2) and type = 'KravPrioritering'", nativeQuery = true)
    void transferPriority(int newKravVersjon, int kravNummer);
}
