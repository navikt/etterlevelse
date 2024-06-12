package no.nav.data.etterlevelse.dokumentRelasjon.domain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DokumentRelasjonRepository extends JpaRepository<DokumentRelasjon, UUID> {

    List<DokumentRelasjon> findByFrom(String from);

    List<DokumentRelasjon> findByTo(String to);

    List<DokumentRelasjon> findByFromAndRelationType(String from, String relationType);

    List<DokumentRelasjon> findByToAndRelationType(String to, String relationType);

}
