package no.nav.data.etterlevelse.melding;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.etterlevelse.melding.domain.MeldingRepo;
import no.nav.data.etterlevelse.melding.dto.MeldingRequest;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;

@Service
@RequiredArgsConstructor
public class MeldingService extends DomainService<Melding> {

    private final MeldingRepo repo;

    public Page<Melding> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public List<Melding> getByMeldingType(String meldingType) {
        return convertToDomaionObject(repo.findByMeldingtype(meldingType));
    }

    public List<Melding> getByMeldingStatus(String meldingStatus) {
        return convertToDomaionObject(repo.findByMeldingStatus(meldingStatus));
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Melding save(MeldingRequest request) {
        var melding = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new Melding();
        melding.merge(request);
        return storage.save(melding);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Melding delete(UUID id) {
        return storage.delete(id);
    }
}
