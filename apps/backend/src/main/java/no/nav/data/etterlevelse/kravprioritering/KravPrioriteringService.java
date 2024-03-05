package no.nav.data.etterlevelse.kravprioritering;

import lombok.RequiredArgsConstructor;
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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;

@Service
@RequiredArgsConstructor
public class KravPrioriteringService extends DomainService<KravPrioritering> {

    private final KravPrioriteringRepo repo;
    private final KravService kravService;

    public Page<KravPrioritering> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public List<KravPrioritering> getByKravNummer(int kravNummer) {
        return convertToDomaionObject(repo.findByKravNummer(kravNummer));
    }

    public List<KravPrioritering> getByKravNummer(int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByKravNummer(kravNummer);
        }
        return convertToDomaionObject(repo.findByKravNummer(kravNummer, kravVersjon));
    }

    public List<KravPrioritering> getByTema(String tema) {
        return convertToDomaionObject(repo.findByTema(tema.substring(0, 3)));
    }

    public List<KravPrioriteringResponse> getByFilter(KravPrioriteringFilter filter) {
        if (!StringUtils.isBlank(filter.getId())) {
            KravPrioritering kravPrioritering = storage.get(UUID.fromString(filter.getId()));
            if (kravPrioritering != null) {
                KravPrioriteringResponse kravPrioriteringResponse = kravPrioritering.toResponse();
                setKravStatus(kravPrioriteringResponse);
                return List.of(kravPrioriteringResponse);
            }
            return List.of();
        } else if (filter.getKravNummer() != null) {
            List<KravPrioriteringResponse> kravPrioriteringList = convertToDomaionObject(repo.findByKravNummer(filter.getKravNummer())).stream().map(KravPrioritering::toResponse).toList();
            kravPrioriteringList.forEach(this::setKravStatus);
            return filterForKravStatus(kravPrioriteringList, filter);
        } else if (filter.getTemaCode() != null) {
            List<KravPrioriteringResponse> kravPrioriteringerResp = convertToDomaionObject(repo.findByTema(filter.getTemaCode().substring(0, 3))).stream().map(KravPrioritering::toResponse).toList();
            kravPrioriteringerResp.forEach(this::setKravStatus);
            return filterForKravStatus(kravPrioriteringerResp, filter);
        }

        List<KravPrioriteringResponse> kravPrioriteringer = convertToDomaionObject(repo.getAll()).stream().map(KravPrioritering::toResponse).toList();
        kravPrioriteringer.forEach(this::setKravStatus);

        return filterForKravStatus(kravPrioriteringer, filter);
    }

    private List<KravPrioriteringResponse> filterForKravStatus(List<KravPrioriteringResponse> kravPrioriteringResponse, KravPrioriteringFilter filter) {
        if (filter.getKravStatus() != null) {
            return kravPrioriteringResponse.stream().filter(kp-> kp.getKravStatus().equals(filter.getKravStatus())).toList();
        }
        return kravPrioriteringResponse;
    }

    private void setKravStatus(KravPrioriteringResponse kravPrioriteringResponse) {
        Optional<Krav> krav = kravService.getByKravNummer(kravPrioriteringResponse.getKravNummer(), kravPrioriteringResponse.getKravVersjon());
        if (krav.isPresent()) {
            kravPrioriteringResponse.setKravStatus(krav.get().getStatus());
        } else {
            kravPrioriteringResponse.setKravStatus(KravStatus.UTGAATT);
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public KravPrioritering save(KravPrioriteringRequest request) {

        var kravprioritering = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new KravPrioritering();
        kravprioritering.merge(request);

        return storage.save(kravprioritering);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public KravPrioritering delete(UUID id) {
        return storage.delete(id);
    }

}
