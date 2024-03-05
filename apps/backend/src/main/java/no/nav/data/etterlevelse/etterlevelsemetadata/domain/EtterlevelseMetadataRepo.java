package no.nav.data.etterlevelse.etterlevelsemetadata.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseMetadataRepo extends JpaRepository<GenericStorage<EtterlevelseMetadata>, UUID> {

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' order by data -> 'kravNummer', data -> 'kravVersjon'",
            countQuery = "select count(1) from generic_storage where type = 'EtterlevelseMetadata'",
            nativeQuery = true)
    Page<GenericStorage<EtterlevelseMetadata>> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' and data -> 'kravNummer' = to_jsonb(?1)", nativeQuery = true)
    List<GenericStorage<EtterlevelseMetadata>> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' and data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2)", nativeQuery = true)
    List<GenericStorage<EtterlevelseMetadata>> findByKravNummerOgKravVersjon(int nummer, int versjon);

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' and data ->> 'etterlevelseDokumentasjonId' = ?1", nativeQuery = true)
    List<GenericStorage<EtterlevelseMetadata>> findByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId);

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' and data ->> 'etterlevelseDokumentasjonId' = ?1 and data -> 'kravNummer' = to_jsonb(?2) and data -> 'kravVersjon' = to_jsonb(?3)", nativeQuery = true)
    List<GenericStorage<EtterlevelseMetadata>> findByEtterlevelseDokumentasjonAndKrav(String etterlevelseDokumentasjonId, int nummer, int versjon);

    @Query(value = "select * from generic_storage where type = 'EtterlevelseMetadata' and data ->> 'etterlevelseDokumentasjonId' = ?1 and data -> 'kravNummer' = to_jsonb(?2)", nativeQuery = true)
    List<GenericStorage<EtterlevelseMetadata>> findByEtterlevelseDokumentasjonAndKravNummer(String behandlingId, int nummer);

}
