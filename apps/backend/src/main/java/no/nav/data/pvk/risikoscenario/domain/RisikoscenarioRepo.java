package no.nav.data.pvk.risikoscenario.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;


public interface RisikoscenarioRepo extends JpaRepository<Risikoscenario, UUID> {

    @Query(value = "select * from risikoscenario where pvk_dokument_id = ?1", nativeQuery = true)
    List<Risikoscenario> findByPvkDokumentId(UUID pvkDokumentId);

    @Query(value = "select * from (" +
            "select distinct on (PVK_DOKUMENT_ID) * from risikoscenario " +
            "order by PVK_DOKUMENT_ID, last_modified_date desc" +
            ") latest where date_trunc('month', last_modified_date) <= date_trunc('month', now() - interval '6 months')", nativeQuery = true)
    List<Risikoscenario> findOnePerDokumentasjonMedLastModifiedEldreEnn6mnd();
}


