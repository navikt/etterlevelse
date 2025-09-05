package no.nav.data.pvk.risikoscenario.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;


public interface RisikoscenarioRepo extends JpaRepository<Risikoscenario, UUID> {

    @Query(value = "select * from risikoscenario where pvk_dokument_id = ?1", nativeQuery = true)
    List<Risikoscenario> findByPvkDokumentId(UUID pvkDokumentId);


}
