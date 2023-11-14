package no.nav.data.etterlevelse.kravprioritering;

import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.kravprioritering.domain.KravPrioritering;
import no.nav.data.etterlevelse.kravprioritering.domain.KravPrioriteringRepo;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringFilter;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringRequest;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class KravPrioriteringService extends DomainService<KravPrioritering> {

    private final KravPrioriteringRepo repo;
    private final KravService kravService;

    public KravPrioriteringService(KravPrioriteringRepo repo, KravService kravService) {
        super(KravPrioritering.class);
        this.repo = repo;
        this.kravService = kravService;
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

    public List<KravPrioritering> getByTema(String tema) {
        return GenericStorage.to(repo.findByTema(tema.substring(0, 3)), KravPrioritering.class);
    }

    public List<KravPrioriteringResponse> getByFilter(KravPrioriteringFilter filter) {
        if (!StringUtils.isBlank(filter.getId())) {
            KravPrioritering kravPrioritering = storage.get(UUID.fromString(filter.getId()), KravPrioritering.class);
            if (kravPrioritering != null) {
                KravPrioriteringResponse kravPrioriteringResponse = kravPrioritering.toResponse();
                setKravStatus(kravPrioriteringResponse);
                return List.of(kravPrioriteringResponse);
            }
            return List.of();
        } else if (filter.getKravNummer() != null) {
            List<KravPrioriteringResponse> kravPrioriteringList = GenericStorage.to(repo.findByKravNummer(filter.getKravNummer()), KravPrioritering.class).stream().map(KravPrioritering::toResponse).toList();
            kravPrioriteringList.forEach(this::setKravStatus);
            return filterForKravStatus(kravPrioriteringList, filter);
        }

        List<KravPrioriteringResponse> kravPrioriteringerResp = GenericStorage.to(repo.findByTema(filter.getTemaCode().substring(0, 3)), KravPrioritering.class).stream().map(KravPrioritering::toResponse).toList();
        kravPrioriteringerResp.forEach(this::setKravStatus);

        return filterForKravStatus(kravPrioriteringerResp, filter);
    }

    private List<KravPrioriteringResponse> filterForKravStatus(List<KravPrioriteringResponse> kravPrioriteringResponse, KravPrioriteringFilter filter) {
        if(filter.getKravStatus() != null) {
            return kravPrioriteringResponse.stream().filter(kp-> kp.getKravStatus().name().equals(filter.getKravStatus())).toList();
        }
        return kravPrioriteringResponse;
    }

    private void setKravStatus(KravPrioriteringResponse kravPrioriteringResponse) {
        Optional<Krav> krav = kravService.getByKravNummer(kravPrioriteringResponse.getKravNummer(), kravPrioriteringResponse.getKravVersjon());
        if(krav.isPresent()) {
            kravPrioriteringResponse.setKravStatus(krav.get().getStatus());
        } else {
            kravPrioriteringResponse.setKravStatus(KravStatus.UTGAATT);
        }
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
