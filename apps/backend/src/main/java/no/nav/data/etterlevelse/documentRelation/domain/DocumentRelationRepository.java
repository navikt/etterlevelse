package no.nav.data.etterlevelse.documentRelation.domain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRelationRepository extends JpaRepository<DocumentRelation, UUID> {

    Optional<DocumentRelation> findById(UUID uuid);

    List<DocumentRelation> findByFromDocument(UUID from);

    List<DocumentRelation> findByToDocument(UUID to);

    DocumentRelation findByFromDocumentAndToDocumentAndRelationType(UUID from, UUID to, RelationType relationType);

    List<DocumentRelation> findByFromDocumentAndRelationType (UUID fromDocument, RelationType relationType);

    List<DocumentRelation> findByToDocumentAndRelationType(UUID toDocument, RelationType relationType);

}
