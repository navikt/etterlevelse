package no.nav.data.etterlevelse.arkivering.domain;

import jakarta.transaction.Transactional;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseArkivRepo extends JpaRepository<GenericStorage<EtterlevelseArkiv>, UUID> {
    @Override
    @Query(value = "select * from generic_storage where type = 'EtterlevelseArkiv'",
            countQuery = "select count(1) from generic_storage where type = 'EtterlevelseArkiv'",
            nativeQuery = true)
    Page<GenericStorage<EtterlevelseArkiv>> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data -> 'webSakNummer' = to_jsonb(?1) and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage<EtterlevelseArkiv>> findByWebsakNummer(String nummer);

    @Query(value = "select * from generic_storage where data -> 'status' = to_jsonb(?1) and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage<EtterlevelseArkiv>> findByStatus(String status);

    @Query(value = "select * from generic_storage where data ->> 'etterlevelseDokumentasjonId' = ?1 and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage<EtterlevelseArkiv>> findByEtterlevelseDokumentsjonId(String behandlingId);

    @Modifying(clearAutomatically = true)
    @Transactional(Transactional.TxType.REQUIRED)
    @Query(value = "update generic_storage set DATA = jsonb_set(DATA, '{arkiveringDato}', to_jsonb(?2) , false ) where data -> 'status' = to_jsonb(?1) and type = 'EtterlevelseArkiv' returning *", nativeQuery = true)
    List<GenericStorage<EtterlevelseArkiv>> updateArkiveringDato(String status, String arkiveringDato);
}
