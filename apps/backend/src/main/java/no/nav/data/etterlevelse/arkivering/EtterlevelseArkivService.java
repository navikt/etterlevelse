package no.nav.data.etterlevelse.arkivering;


import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivRepo;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.common.domain.DomainService;
import org.plutext.jaxb.svg11.G;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EtterlevelseArkivService extends DomainService<EtterlevelseArkiv> {
    private final EtterlevelseArkivRepo repo;

    public EtterlevelseArkivService(EtterlevelseArkivRepo repo) {
        super(EtterlevelseArkiv.class);
        this.repo = repo;
    }

    public Page<EtterlevelseArkiv> getAll(PageParameters pageParameters){
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::toEtterlevelseArkiv);
    }

    public List<EtterlevelseArkiv> getByWebsakNummer(String websakNummer) {
        return GenericStorage.to(repo.findByWebsakNummer(websakNummer), EtterlevelseArkiv.class);
    }

    public List<EtterlevelseArkiv> getByStatus(String status) {
        return GenericStorage.to(repo.findByStatus(status), EtterlevelseArkiv.class);
    }

    public List<EtterlevelseArkiv> getByBehandling(String behandlingId) {
        return GenericStorage.to(repo.findByBehandling(behandlingId), EtterlevelseArkiv.class);
    }

    public EtterlevelseArkiv save(EtterlevelseArkivRequest request) {
        var etterlevelseArkiv = request.isUpdate() ? storage.get(request.getIdAsUUID(), EtterlevelseArkiv.class) : new EtterlevelseArkiv();
        etterlevelseArkiv.convert(request);

        return storage.save(etterlevelseArkiv);
    }

    public EtterlevelseArkiv delete(UUID id) { return storage.delete(id, EtterlevelseArkiv.class);}
}
