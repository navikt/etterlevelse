package no.nav.data.etterlevelse.etterlevelse.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;
import java.util.UUID;

public interface EtterlevelseRepo extends JpaRepository<GenericStorage, UUID> {

    @Override
    @Query(value = "select * from generic_storage where type = 'Etterlevelse' order by data -> 'kravNummer', data -> 'kravVersjon'",
            countQuery = "select count(1) from generic_storage where type = 'Etterlevelse'",
            nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2) and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByKravNummer(int nummer, int versjon);

    @Query(value = "select * from generic_storage where data ->> 'behandlingId' = ?1 and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByBehandling(String behandlingId);

    @Query(value = "select * from generic_storage where data ->> 'behandlingId' in ?1 and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByBehandlinger(List<String> behandlingIds);

    @Query(value = "select * from generic_storage where data ->> 'behandlingId' = ?1 and data-> 'kravNummer' = to_jsonb(?2) and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByBehandlingsIdAndKravNummer(String behandlingsId, int nummer);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value= "update generic_storage set DATA = jsonb_set(DATA, '{behandlingId}', to_jsonb(?2), false) where data ->> 'behandlingId' = ?1 and type = 'Etterlevelse'", nativeQuery = true)
    void updateEtterlevelseToNewBehandling(String oldBehandlingsId, String newBehandlinsId);
}
