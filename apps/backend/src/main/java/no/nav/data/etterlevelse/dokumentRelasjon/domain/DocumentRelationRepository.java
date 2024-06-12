package no.nav.data.etterlevelse.dokumentRelasjon.domain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentRelationRepository extends JpaRepository<DocumentRelation, UUID> {

    List<DocumentRelation> findByFrom(String from);

    List<DocumentRelation> findByTo(String to);

    List<DocumentRelation> findByFromAndRelationType(String from, String relationType);

    List<DocumentRelation> findByToAndRelationType(String to, String relationType);

}
