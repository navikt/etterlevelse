package no.nav.data.pvk.pvkdokument.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PvkDokumentRepo extends JpaRepository<PvkDokument, UUID> {
    
    // FIXME: Fjern
    @Query(value = "select * from pvk_dokument where etterlevelse_dokumentasjon_id = ?1", nativeQuery = true)
    Optional<PvkDokument> findByetterlevelseDokumentId(UUID etterlevelseDokumentasjonId);

    @Query(value = "select * from pvk_dokument where date_trunc('month', last_modified_date) <= date_trunc('month', now() - interval '6 months') and data ->> 'pvkVurdering' != 'ALLEREDE_UTFORT' and data ->> 'pvkVurdering' != 'SKAL_IKKE_UTFORE' and data ->> 'pvkVurdering' != 'UNDEFINED'", nativeQuery = true)
    List<PvkDokument> findPvkDokumentMedLastModifiedEldreEnn6mnd();
}
