package no.nav.data.etterlevelse.etterlevelse.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseRepo extends JpaRepository<GenericStorage, UUID> {

    @Override
    @Query(value = "select * from generic_storage where type = 'Etterlevelse'",
            countQuery = "select count(1) from generic_storage where type = 'Etterlevelse'",
            nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByKravNummer(int nummer);

    @Query(value = "select * from generic_storage where data -> 'kravNummer' = to_jsonb(?1) and data -> 'kravVersjon' = to_jsonb(?2) and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByKravNummer(int nummer, int versjon);

    @Query(value = "select * from generic_storage where data ->> 'etterlevelseDokumentasjonId' = ?1 and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByEtterlevelseDokumensjon(String etterlevelseDokumentasjonId);

    @Query(value = "select * from generic_storage where data ->> 'etterlevelseDokumentasjonId' in ?1 and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByEtterlevelseDokumentasjoner(List<String> etterlevelseDokumentasjonIds);

    @Query(value = "select * from generic_storage where data ->> 'etterlevelseDokumentasjonId' = ?1 and data-> 'kravNummer' = to_jsonb(?2) and type = 'Etterlevelse'", nativeQuery = true)
    List<GenericStorage> findByEtterlevelseDokumentasjonIdAndKravNummer(String etterlevelseDokumentasjonId, int nummer);

}
