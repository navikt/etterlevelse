package no.nav.data.etterlevelse.documentRelation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.jpa.OptimisticLockUtil;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelationRepository;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
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
    public DocumentRelation create(DocumentRelation documentRelation) {
        if (null != findByFromDocumentAndToDocumentAndRelationType(documentRelation.getFromDocument(), documentRelation.getToDocument(), documentRelation.getRelationType())) {
            throw new ValidationException("Document relation already exist");
        }
        try {
            return repository.save(documentRelation);
        } catch (DataIntegrityViolationException e) {
            log.warn("Redquested to create an existing relation or a relation including non-existing documents");
            throw new ValidationException("Can not create document relation: will cause duplicate relation or relation to non-existing documents");
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelation update(DocumentRelation documentRelation, Integer expectedVersion) {
        try {
            DocumentRelation oldDocumentRelation = repository.getReferenceById(documentRelation.getId());
            OptimisticLockUtil.checkVersion(DocumentRelation.class, documentRelation.getId(), oldDocumentRelation.getVersion(), expectedVersion);
            oldDocumentRelation.setRelationType(documentRelation.getRelationType());
            oldDocumentRelation.setFromDocument(documentRelation.getFromDocument());
            oldDocumentRelation.setToDocument(documentRelation.getToDocument());
            oldDocumentRelation.setData(documentRelation.getData());
            return repository.saveAndFlush(oldDocumentRelation);
        } catch (DataIntegrityViolationException e) {
            log.warn("Redquested to update a relation to a duplicate of existing relation or to include non-existing documents", e);
            throw new ValidationException("Can not update document relation: will cause duplicate relation or non-existing documents");
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelation deleteById(UUID id) {
        return deleteById(id, null);
    }

    /**
     * @param version versjonen klienten sist leste. Sjekkes hvis oppgitt.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelation deleteById(UUID id, Integer version) {
        DocumentRelation documentRelation = getById(id);
        OptimisticLockUtil.checkVersionIfPresent(DocumentRelation.class, id, documentRelation.getVersion(), version);
        repository.deleteById(id);
        return documentRelation;
    }
}
