package no.nav.data.etterlevelse.documentRelation;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelationRepository;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationRequest;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
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
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    public DocumentRelationResponse getById(UUID id, Boolean widthDocumentData){
        var documentRelation = repository.findById(id);

        if(documentRelation.isPresent()) {
            var resp = documentRelation.get().toResponse();
            if (widthDocumentData) {
                var etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelation.get().getFromDocument()));

                resp.setFromDocumentWithData(etterlevelseDokumentasjon.toResponse());
            }

            return resp;
        } else {
            throw new NotFoundException("Couldn't find GenericStorage with id " + id);
        }
    }

    public Page<DocumentRelation> getAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public List<DocumentRelationResponse> findByFromDocument(String fromDocumentId, Boolean widthDocumentData) {
        return repository.findByFromDocument(fromDocumentId).stream().map((documentRelation -> {

            var documentRelationResponse = documentRelation.toResponse();

            if(widthDocumentData) {
                var etterlevelsesDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelationResponse.getFromDocument()));
                documentRelationResponse.setToDocumentWithData(etterlevelsesDokumentasjon.toResponse());
            }

            return documentRelationResponse;
        })).toList();
    }

    public List<DocumentRelationResponse> findByToDocument(String toDocumentId, Boolean widthDocumentData) {
        return repository.findByToDocument(toDocumentId).stream().map((documentRelation -> {

            var documentRelationResponse = documentRelation.toResponse();

            if(widthDocumentData) {
                var etterlevelsesDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelationResponse.getFromDocument()));
                documentRelationResponse.setFromDocumentWithData(etterlevelsesDokumentasjon.toResponse());
            }

            return documentRelationResponse;
        })).toList();

    }


    public List<DocumentRelationResponse> findByFromDocumentAndRelationType (String fromDocumentId, RelationType relationType, Boolean widthDocumentData){
        return repository.findByFromDocumentAndRelationType(fromDocumentId, relationType).stream().map((documentRelation -> {

            var documentRelationResponse = documentRelation.toResponse();

            if(widthDocumentData) {
                var etterlevelsesDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelationResponse.getFromDocument()));
                documentRelationResponse.setToDocumentWithData(etterlevelsesDokumentasjon.toResponse());
            }

            return documentRelationResponse;
        })).toList();
    };

    public List<DocumentRelationResponse> findByToDocumentAndRelationType(String toDocumentId, RelationType relationType, Boolean widthDocumentData){
        return repository.findByToDocumentAndRelationType(toDocumentId, relationType).stream().map((documentRelation -> {

            var documentRelationResponse = documentRelation.toResponse();

            if(widthDocumentData) {
                var etterlevelsesDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(documentRelationResponse.getFromDocument()));
                documentRelationResponse.setFromDocumentWithData(etterlevelsesDokumentasjon.toResponse());
            }

            return documentRelationResponse;
        })).toList();
    };

    public DocumentRelation findByFromDocumentAndToDocumentAndRelationType(String fromDocumentId, String toDocumentId, RelationType relationType) {
        return repository.findByFromDocumentAndToDocumentAndRelationType(fromDocumentId, toDocumentId, relationType);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelation save(DocumentRelationRequest request) {
        DocumentRelation documentRelation = request.isUpdate() ? repository.getReferenceById(request.getIdAsUUID()) : new DocumentRelation();
        documentRelation.merge(request);

        return repository.save(documentRelation);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelationResponse deleteById(UUID id){
        DocumentRelationResponse documentRelation = getById(id, false);
        repository.deleteById(id);
        return documentRelation;
    }
}
