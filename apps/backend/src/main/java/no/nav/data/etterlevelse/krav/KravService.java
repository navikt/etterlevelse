package no.nav.data.etterlevelse.krav;

import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravRequest.Fields;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.security.SecurityUtils.isKravEier;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Service
public class KravService extends DomainService<Krav> {

    public KravService() {
        super(Krav.class);
    }

    public Page<Krav> getAll(PageParameters pageParameters) {
        Pageable page = pageParameters.createPage();
        Page<GenericStorage> all;
        if (isKravEier()) {
            all = kravRepo.findAll(page);
        } else {
            all = kravRepo.findAllNonUtkast(page);
        }
        return all.map(GenericStorage::toKrav);
    }

    public List<Krav> getByFilter(KravFilter filter) {
        return convert(kravRepo.findBy(filter), GenericStorage::toKrav);
    }

    public List<Krav> getByKravNummer(int kravNummer) {
        return GenericStorage.to(kravRepo.findByKravNummer(kravNummer), Krav.class);
    }

    public Optional<Krav> getByKravNummer(int kravNummer, int kravVersjon) {
        return kravRepo.findByKravNummer(kravNummer, kravVersjon)
                .map(GenericStorage::toKrav);
    }

    public List<Krav> search(String name) {
        List<GenericStorage> byNameContaining = new ArrayList<>(kravRepo.findByNameContaining(name));
        if (StringUtils.isNumeric(name)) {
            byNameContaining.addAll(kravRepo.findByKravNummer(Integer.parseInt(name)));
        }
        if (!isKravEier()) {
            byNameContaining.removeIf(gs -> gs.toKrav().getStatus().erUtkast());
        }
        return convert(byNameContaining, GenericStorage::toKrav);
    }

    public Krav save(KravRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateName)
                .addValidations(this::validateStatus)
                .addValidations(this::validateKravNummerVersjon)
                .ifErrorsThrowValidationException();

        var krav = request.isUpdate() ? storage.get(request.getIdAsUUID(), Krav.class) : new Krav();
        krav.convert(request);
        if (request.isNyKravVersjon()) {
            krav.setKravNummer(request.getKravNummer());
            krav.setKravVersjon(kravRepo.nextKravVersjon(request.getKravNummer()));
        } else if (!request.isUpdate()) {
            krav.setKravNummer(kravRepo.nextKravNummer());
        }

        return storage.save(krav);
    }

    public Krav delete(UUID id) {
        return storage.delete(id, Krav.class);
    }

    public List<Krav> findForBehandling(String behandlingId) {
        return getByFilter(KravFilter.builder().behandlingId(behandlingId).build());
    }

    public List<KravImage> saveImages(List<KravImage> images) {
        return GenericStorage.to(storage.saveAll(images), KravImage.class);
    }

    public KravImage getImage(UUID kravId, UUID fileId) {
        return kravRepo.findKravImage(kravId, fileId).getDomainObjectData(KravImage.class);
    }

    private void validateName(Validator<KravRequest> validator) {
        String name = validator.getItem().getNavn();
        if (name == null) {
            return;
        }
        var items = filter(storage.findByNameAndType(name, validator.getItem().getRequestType()), t -> !t.getId().equals(validator.getItem().getIdAsUUID()));
        if (!items.isEmpty()) {
            validator.addError(Fields.navn, Validator.ALREADY_EXISTS, "name '%s' already in use".formatted(name));
        }
    }

    private void validateKravNummerVersjon(Validator<KravRequest> validator) {
        KravRequest req = validator.getItem();
        Integer kravNummer = req.getKravNummer();
        boolean nyKravVersjon = req.isNyKravVersjon();
        if (nyKravVersjon && kravNummer != null) {
            if (getByKravNummer(kravNummer).isEmpty()) {
                validator.addError(Fields.kravNummer, Validator.DOES_NOT_EXIST, "KravNummer %d does not exist".formatted(kravNummer));
            }
        }
    }

    private void validateStatus(Validator<KravRequest> validator) {
        KravRequest req = validator.getItem();
        if (!req.isUpdate()) {
            return;
        }
        Krav oldKrav = validator.getDomainItem(Krav.class);
        if (req.getStatus() == KravStatus.UTKAST && oldKrav.getStatus() != KravStatus.UTKAST) {
            var etterlevelser = etterlevelseRepo.findByKravNummer(oldKrav.getKravNummer(), oldKrav.getKravVersjon());
            if (!etterlevelser.isEmpty()) {
                validator.addError(Fields.status, "INVALID_STATUS", "Krav already contains %d etterlevelser, cannot change status to UTKAST".formatted(etterlevelser.size()));
            }
        }
    }

    @SchedulerLock(name = "clean_krav_images", lockAtLeastFor = "PT5M")
    @Scheduled(initialDelayString = "PT5M", fixedRateString = "PT1H")
    public void cleanupImages() {
        var deletes = kravRepo.cleanupImages();
        log.info("Deleted {} unused krav images", deletes);
    }
}
