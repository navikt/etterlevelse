package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.KravId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseDokumentasjonRepo  extends JpaRepository<GenericStorage, UUID>, EtterlevelseDokumentasjonRepoCustom {


    @Override
    @Query(value = "select * from generic_storage where type = 'EtterlevelseDokumentasjon'",
            countQuery = "select count(1) from generic_storage where type = 'EtterlevelseDokumentasjon'",
            nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);


    @Query(value = "select * from generic_storage where data ->> 'virkemiddelId' in ?1 and type = 'EtterlevelseDokumentasjon'", nativeQuery = true)
    List<GenericStorage> findByVirkemiddelIds(List<String> ids);


    //must refactor KravRepoImpl to change usage of findBy, DO THIS AFTER MIGRATION
    @Query(value = """
            select 
             data ->> 'kravNummer' as kravNummer, data ->> 'kravVersjon' as kravVersjon
             from generic_storage
             where type = 'Etterlevelse'
             and data ->> 'etterlevelseDokumentasjonId' = :etterlevelseDokId
            """, nativeQuery = true)
    List<KravId> findKravIdsForEtterlevelseDokumentasjon(String etterlevelseDokId);

    @Query(value = "select * from generic_storage where data ->> 'title' ilike %?1% and type = 'EtterlevelseDokumentasjon'", nativeQuery = true)
    List<GenericStorage> searchEtterlevelseDokumentasjonByTitle(String searchParam);

    @Query(value = "select * from generic_storage where data ->> 'etterlevelseNummer' ilike %?1% and type = 'EtterlevelseDokumentasjon'", nativeQuery = true)
    List<GenericStorage> searchEtterlevelseDokumentasjonByNumber(String searchParam);

    @Query(value = "SELECT nextVal('etterlevelse_nummer')",nativeQuery = true)
    int nextEtterlevelseDokumentasjonNummer();
}
