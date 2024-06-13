package no.nav.data.etterlevelse.documentRelation.domain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentRelationRepository extends JpaRepository<DocumentRelation, UUID> {

    List<DocumentRelation> findByFromDocument(String from);

    List<DocumentRelation> findByToDocument(String to);

    List<DocumentRelation> findByFromDocumentAndRelationType (String fromDocument, RelationType relationType);

    List<DocumentRelation> findByToDocumentAndRelationType(String toDocument, RelationType relationType);

}
