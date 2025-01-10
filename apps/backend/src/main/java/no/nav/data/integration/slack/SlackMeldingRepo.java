package no.nav.data.integration.slack;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SlackMeldingRepo extends JpaRepository<SlackMelding, Integer> {
    
    @Query(value = "select * from slack_melding where (data ->> 'prioritet')::integer >= ?1 limit 1", nativeQuery = true)
    public Optional<SlackMelding> getOneWithPriority(int priorityThreshold);
    
}
