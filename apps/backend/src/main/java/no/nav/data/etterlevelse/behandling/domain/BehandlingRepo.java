package no.nav.data.etterlevelse.behandling.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.KravId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface BehandlingRepo extends JpaRepository<GenericStorage, UUID>, BehandlingRepoCustom {

    @Query(value = "select * from generic_storage where data ->> 'behandlingId' in ?1 and type = 'BehandlingData'", nativeQuery = true)
    List<GenericStorage> findByBehandlingIds(List<String> ids);

    @Query(value = """
            select 
             data ->> 'kravNummer' as kravNummer, data ->> 'kravVersjon' as kravVersjon
             from generic_storage
             where type = 'Etterlevelse'
             and data ->> 'behandlingId' = :behandlingId
            """, nativeQuery = true)
    List<KravId> findKravIdsForBehandling(String behandlingId);
}
