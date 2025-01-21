package no.nav.data.pvk.tiltak.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


public interface TiltakRepo extends JpaRepository<Tiltak, UUID> {

    @Query(value = "select * from tiltak where pvk_dokument_id = ?1", nativeQuery = true)
    List<Tiltak> findByPvkDokumentId(String pvkDokumentId);
    
    @Query(value="select risikoscenario_id from risikoscenario_tiltak_relation where tiltak_id = ?1", nativeQuery = true)
    List<String> getRisikoscenarioForTiltak(UUID tiltakId);
    
    @Query(value="select tiltak_id from risikoscenario_tiltak_relation where risikoscenario_id = ?1", nativeQuery = true)
    List<String> getTiltakForRisikoscenario(UUID risikoscenarioId);
    
    @Transactional(propagation = Propagation.MANDATORY)
    @Modifying
    @Query(value="delete from risikoscenario_tiltak_relation where risikoscenario = ?1 and tiltak = ?2", nativeQuery = true)
    int deleteTiltakRisikoscenarioRelation(UUID risikoscenarioId, UUID tiltakId);

    @Transactional(propagation = Propagation.MANDATORY)
    @Modifying
    @Query(value="insert into risikoscenario_tiltak_relation (risikoscenario, tiltak) values (?1, ?2)", nativeQuery = true)
    int insertTiltakRisikoscenarioRelation(UUID risikoscenarioId, UUID tiltakId);

}