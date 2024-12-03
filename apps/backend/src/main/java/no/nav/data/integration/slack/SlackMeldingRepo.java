package no.nav.data.integration.slack;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SlackMeldingRepo extends JpaRepository<SlackMelding, Integer> {
    
    @Query(value = "select * from slack_melding limit 1", nativeQuery = true)
    public SlackMelding getOne();
    
}
