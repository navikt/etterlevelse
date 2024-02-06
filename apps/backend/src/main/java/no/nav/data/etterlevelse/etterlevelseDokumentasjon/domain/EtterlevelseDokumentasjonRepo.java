package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.KravId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseDokumentasjonRepo  extends JpaRepository<GenericStorage<EtterlevelseDokumentasjon>, UUID>, EtterlevelseDokumentasjonRepoCustom {


    @Override
    @Query(value = "select * from generic_storage where type = 'EtterlevelseDokumentasjon'",
            countQuery = "select count(1) from generic_storage where type = 'EtterlevelseDokumentasjon'",
            nativeQuery = true)
    Page<GenericStorage<EtterlevelseDokumentasjon>> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data ->> 'virkemiddelId' in ?1 and type = 'EtterlevelseDokumentasjon'", nativeQuery = true)
    List<GenericStorage<EtterlevelseDokumentasjon>> findByVirkemiddelIds(List<String> ids);

    @Query(value = """
            select 
             data ->> 'kravNummer' as kravNummer, data ->> 'kravVersjon' as kravVersjon
             from generic_storage
             where type = 'Etterlevelse'
             and data ->> 'etterlevelseDokumentasjonId' = :etterlevelseDokId
            """, nativeQuery = true)
    List<KravId> findKravIdsForEtterlevelseDokumentasjon(String etterlevelseDokId);

    @Query(value = "select * from generic_storage where data ->> 'title' ilike %?1% or data ->> 'etterlevelseNummer' ilike %?1%  and type = 'EtterlevelseDokumentasjon'", nativeQuery = true)
    List<GenericStorage<EtterlevelseDokumentasjon>> searchEtterlevelseDokumentasjon(String searchParam);

    @Query(value = "SELECT nextVal('etterlevelse_nummer')",nativeQuery = true)
    int nextEtterlevelseDokumentasjonNummer();

    @Query(value = "select * from generic_storage where type = 'EtterlevelseDokumentasjon'", nativeQuery = true )
    List<GenericStorage<EtterlevelseDokumentasjon>> getAllEtterlevelseDokumentasjoner();

    @Query(value = "select * from generic_storage where type = 'EtterlevelseDokumentasjon' and data->> 'title' not ilike '%fant ikke behandling%' and data->'behandlingIds' != '[]'", nativeQuery = true)
    List<GenericStorage<EtterlevelseDokumentasjon>> getAllEtterlevelseDokumentasjonWithValidBehandling();
}
