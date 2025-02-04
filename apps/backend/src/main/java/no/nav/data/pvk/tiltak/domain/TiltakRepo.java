package no.nav.data.pvk.tiltak.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


public interface TiltakRepo extends JpaRepository<Tiltak, UUID> {

    @Query(value = "select * from tiltak where pvk_dokument_id = uuid(?1)", nativeQuery = true)
    List<Tiltak> findByPvkDokumentId(String pvkDokumentId);
    
    @Query(value="select risikoscenario_id from risikoscenario_tiltak_relation where tiltak_id = uuid(?1)", nativeQuery = true)
    List<String> getRisikoscenarioForTiltak(String tiltakId);
    
    @Query(value="select tiltak_id from risikoscenario_tiltak_relation where risikoscenario_id = uuid(?1)", nativeQuery = true)
    List<String> getTiltakForRisikoscenario(String risikoscenarioId);
    
    @Transactional(propagation = Propagation.MANDATORY)
    @Modifying
    @Query(value="delete from risikoscenario_tiltak_relation where risikoscenario_id = uuid(?1) and tiltak_id = uuid(?2)", nativeQuery = true)
    int deleteTiltakRisikoscenarioRelation(String risikoscenarioId, String tiltakId);

    @Transactional(propagation = Propagation.MANDATORY)
    @Modifying
    @Query(value="insert into risikoscenario_tiltak_relation (risikoscenario_id, tiltak_id) values (uuid(?1), uuid(?2))", nativeQuery = true)
    int insertTiltakRisikoscenarioRelation(String risikoscenarioId, String tiltakId);

    @Transactional
    @Modifying
    @Query(value="delete from risikoscenario_tiltak_relation", nativeQuery = true)
    int deleteAllTiltakRisikoscenarioRelations();

}