package no.nav.data.etterlevelse.tildeling.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TildelingRepo extends JpaRepository<GenericStorage, UUID> {
    @Override
    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' order by data -> 'kravNummer', data -> 'kravVersjon'",
            countQuery = "select count(1) from generic_storage where type = 'EtterlevelseMetadata'",
            nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' and data -> 'kravNummer' = to_jsonb(?1)", nativeQuery = true)
    List<GenericStorage> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' and data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2)", nativeQuery = true)
    List<GenericStorage> findByKravNummerOgKravVersjon(int nummer, int versjon);

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' and data ->> 'behandlingId' = ?1", nativeQuery = true)
    List<GenericStorage> findByBehandling(String behandlingId);
}
