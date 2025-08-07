package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import no.nav.data.etterlevelse.common.domain.KravId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseDokumentasjonRepo extends JpaRepository<EtterlevelseDokumentasjon, UUID> {

    @Query(value = """
            select 
             krav_nummer as kravNummer, krav_versjon as kravVersjon
             from etterlevelse
             where etterlevelse_dokumentasjon_id = :etterlevelseDokId
            """, nativeQuery = true)
    List<KravId> findKravIdsForEtterlevelseDokumentasjon(UUID etterlevelseDokId);

    @Query(value = "select * from etterlevelse_dokumentasjon where data ->> 'title' ilike %?1% or data ->> 'etterlevelseNummer' ilike %?1%", nativeQuery = true)
    List<EtterlevelseDokumentasjon> searchEtterlevelseDokumentasjon(String searchParam);

    @Query(value = "select nextVal('etterlevelse_nummer')", nativeQuery = true)
    int nextEtterlevelseDokumentasjonNummer();

    @Query(value = "select * from etterlevelse_dokumentasjon", nativeQuery = true )
    List<EtterlevelseDokumentasjon> getAllEtterlevelseDokumentasjoner();

    @Query(value = "select * from etterlevelse_dokumentasjon where data->> 'title' not ilike '%fant ikke behandling%' and data->'behandlingIds' != '[]'",
            countQuery = "select count(1) from etterlevelse_dokumentasjon where data->> 'title' not ilike '%fant ikke behandling%' and data->'behandlingIds' != '[]'",
            nativeQuery = true)
    Page<EtterlevelseDokumentasjon> getAllEtterlevelseDokumentasjonWithValidBehandling(Pageable pageable);
}
