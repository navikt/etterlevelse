package no.nav.data.etterlevelse.documentRelation;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelationRepository;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentRelationService {

    private final DocumentRelationRepository repository;

    public DocumentRelation getById(UUID id) {
        var documentRelation = repository.findById(id);
        return documentRelation.orElseThrow(() -> new NotFoundException("Couldn't find DocumentRelation with id " + id));
    }

    public Page<DocumentRelation> getAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public List<DocumentRelation> findByFromDocument(UUID fromDocumentId) {
        return repository.findByFromDocument(fromDocumentId);
    }

    public List<DocumentRelation> findByToDocument(UUID toDocumentId) {
        return repository.findByToDocument(toDocumentId);
    }

    public List<DocumentRelation> findByFromDocumentAndRelationType (UUID fromDocumentId, RelationType relationType) {
        return repository.findByFromDocumentAndRelationType(fromDocumentId, relationType);
    };

    public List<DocumentRelation> findByToDocumentAndRelationType(UUID toDocumentId, RelationType relationType) {
        return repository.findByToDocumentAndRelationType(toDocumentId, relationType);
    };

    public DocumentRelation findByFromDocumentAndToDocumentAndRelationType(UUID fromDocumentId, UUID toDocumentId, RelationType relationType) {
        return repository.findByFromDocumentAndToDocumentAndRelationType(fromDocumentId, toDocumentId, relationType);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelation save(DocumentRelation documentRelation, boolean isUpdate) {
        if (isUpdate) {
            DocumentRelation oldDocumentRelation = repository.getReferenceById(documentRelation.getId());
            oldDocumentRelation.setRelationType(documentRelation.getRelationType());
            oldDocumentRelation.setFromDocument(documentRelation.getFromDocument());
            oldDocumentRelation.setToDocument(documentRelation.getToDocument());
            oldDocumentRelation.setData(documentRelation.getData());
            return repository.save(oldDocumentRelation);
        } else {
            return repository.save(documentRelation);
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelation deleteById(UUID id) {
        DocumentRelation documentRelation = getById(id);
        repository.deleteById(id);
        return documentRelation;
    }
}
