package no.nav.data.etterlevelse.kravprioritylist;

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

import java.util.UUID;

@Service
public class KravPriorityListService extends DomainService<KravPriorityList>  {

    private final KravPriorityListRepo repo;

    public KravPriorityListService(KravPriorityListRepo repo) {
        this.repo = repo;
    }

    public Page<KravPriorityList> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public KravPriorityList getByTema(String tema) {
        return repo.findByTema(tema).getDomainObjectData();
    }

    public Integer getPriorityForKravByTema(String tema, Integer kravNummer){
        KravPriorityList kravPriorityList = getByTema(tema);
        return kravPriorityList.getPriorityList().stream().toList().indexOf(kravNummer);
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
