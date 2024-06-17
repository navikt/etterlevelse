package no.nav.data.etterlevelse.documentRelation.domain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRelationRepository extends JpaRepository<DocumentRelation, UUID> {

    Optional<DocumentRelation> findById(UUID uuid);

    List<DocumentRelation> findByFromDocument(String from);

    List<DocumentRelation> findByToDocument(String to);

    DocumentRelation findByFromDocumentAndToDocumentAndRelationType(String from,String to, RelationType relationType);

    List<DocumentRelation> findByFromDocumentAndRelationType (String fromDocument, RelationType relationType);

    List<DocumentRelation> findByToDocumentAndRelationType(String toDocument, RelationType relationType);

}
