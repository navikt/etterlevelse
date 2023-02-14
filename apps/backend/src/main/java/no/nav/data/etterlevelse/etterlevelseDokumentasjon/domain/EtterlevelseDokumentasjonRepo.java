package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.KravId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseDokumentasjonRepo  extends JpaRepository<GenericStorage, UUID>, EtterlevelseDokumentasjonRepoCustom {
    @Query(value = "select * from generic_storage where data ->> 'behandlingId' in ?1 and type = 'EtterlevelseDokumentasjon'", nativeQuery = true)
    List<GenericStorage> findByBehandlingIds(List<String> ids);

    @Query(value = """
            select 
             data ->> 'kravNummer' as kravNummer, data ->> 'kravVersjon' as kravVersjon
             from generic_storage
             where type = 'Etterlevelse'
             and data ->> 'etterlevelseDokId' = :etterlevelseDokId
            """, nativeQuery = true)
    List<KravId> findKravIdsForEtterlevelseDokumentasjon(String etterlevelseDokId);

    @Query(value = "SELECT nextVal('etterlevelse_nummer')",nativeQuery = true)
    int nextEtterlevelseDokumentasjonNummer();
}
