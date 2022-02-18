package no.nav.data.etterlevelse.melding;

import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.etterlevelse.melding.domain.MeldingRepo;
import no.nav.data.etterlevelse.melding.domain.MeldingStatus;
import no.nav.data.etterlevelse.melding.domain.MeldingType;
import no.nav.data.etterlevelse.melding.dto.MeldingRequest;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MeldingService extends DomainService<Melding> {

    private final MeldingRepo repo;

    public MeldingService(MeldingRepo repo) {
        super(Melding.class);
        this.repo = repo;
    }

    public Page<Melding> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::toMelding);
    }

    public Optional<Melding> getById(UUID id) {
        return repo.findById(id).map(GenericStorage::toMelding);
    }

    public List<Melding> getByMeldingType(MeldingType meldingType) {
        return GenericStorage.to(repo.findByMeldingtype(meldingType),Melding.class);
    }

    public List<Melding> getByMeldingStatus(MeldingStatus meldingStatus) {
        return GenericStorage.to(repo.findByMeldingStatus(meldingStatus),Melding.class);
    }

    public Melding save(MeldingRequest request) {
        var melding = request.isUpdate() ? storage.get(request.getIdAsUUID(), Melding.class) : new Melding();
        melding.convert(request);
        return storage.save(melding);
    }

    public Melding delete(UUID id) {
        return storage.delete(id, Melding.class);
    }
}
