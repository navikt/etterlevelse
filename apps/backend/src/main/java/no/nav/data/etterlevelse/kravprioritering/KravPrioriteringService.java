package no.nav.data.etterlevelse.kravprioritering;

import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.kravprioritering.domain.KravPrioritering;
import no.nav.data.etterlevelse.kravprioritering.domain.KravPrioriteringRepo;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringRequest;
import org.springframework.data.domain.Page;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KravPrioriteringService extends DomainService<KravPrioritering> {

    private final KravPrioriteringRepo repo;

    public KravPrioriteringService(KravPrioriteringRepo repo) {
        super(KravPrioritering.class);
        this.repo = repo;
    }

    public Page<KravPrioritering> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::toKravPrioritering);
    }

    public List<KravPrioritering> getByKravNummer(int kravNummer) {
        return GenericStorage.to(repo.findByKravNummer(kravNummer), KravPrioritering.class);
    }

    public List<KravPrioritering> getByKravNummer(int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByKravNummer(kravNummer);
        }
        return GenericStorage.to(repo.findByKravNummer(kravNummer, kravVersjon), KravPrioritering.class);
    }

    public List<KravPrioritering> getByTema(String  tema) {
        return GenericStorage.to(repo.findByTema(tema.substring(0, 3)), KravPrioritering.class);
    }

    public KravPrioritering save(KravPrioriteringRequest request) {

        var kravprioritering = request.isUpdate() ? storage.get(request.getIdAsUUID(), KravPrioritering.class) : new KravPrioritering();
        kravprioritering.convert(request);

        return storage.save(kravprioritering);
    }

    public KravPrioritering delete(UUID id) {
        return storage.delete(id, KravPrioritering.class);
    }

}
