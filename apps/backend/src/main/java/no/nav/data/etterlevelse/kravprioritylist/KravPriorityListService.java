package no.nav.data.etterlevelse.kravprioritylist;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityList;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityListRepo;
import no.nav.data.etterlevelse.kravprioritylist.dto.KravPriorityListRequest;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KravPriorityListService extends DomainService<KravPriorityList>  {

    private final KravPriorityListRepo repo;

    public Page<KravPriorityList> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public Optional<KravPriorityList> getByTema(String tema) {
        return repo.findByTema(tema).map(GenericStorage::getDomainObjectData);
    }

    public KravPriorityList save(KravPriorityListRequest request) {

        var kravPriorityList = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new KravPriorityList();
        kravPriorityList.convert(request);

        return storage.save(kravPriorityList);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public KravPriorityList delete(UUID id) {
        return storage.delete(id);
    }
}
