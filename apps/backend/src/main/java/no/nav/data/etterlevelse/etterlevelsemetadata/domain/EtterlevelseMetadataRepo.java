package no.nav.data.etterlevelse.etterlevelsemetadata.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseMetadataRepo extends JpaRepository<EtterlevelseMetadata, UUID> {

    List<EtterlevelseMetadata> findByKravNummer(int kravNummer);

    List<EtterlevelseMetadata> findByKravNummerAndKravVersjon(int kravNummer, int kravVersjon);

    List<EtterlevelseMetadata> findByEtterlevelseDokumentasjon(UUID etterlevelseDokumentId);

    @Query(value = "select * from etterlevelse_metadata where etterlevelse_dokumentasjon = ?1 and krav_nummer = ?2 and krav_versjon = ?3", nativeQuery = true)
    List<EtterlevelseMetadata> findByEtterlevelseDokumentasjonAndKrav(UUID etterlevelseDokumentId, int kravNummer, int kravVersjon);

    List<EtterlevelseMetadata> findByEtterlevelseDokumentasjonAndKravNummer(UUID etterlevelseDokumentId, int kravNummer);

}
