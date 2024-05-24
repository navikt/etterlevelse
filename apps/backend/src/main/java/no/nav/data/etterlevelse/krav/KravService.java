package no.nav.data.etterlevelse.krav;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.storage.StorageService;
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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.security.SecurityUtils.isKravEier;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Service
@RequiredArgsConstructor
public class KravService extends DomainService<Krav> {

    protected final StorageService<KravImage> imageStorage;

    public Page<Krav> getAll(Pageable page) {
        Page<GenericStorage<Krav>> all;
        if (isKravEier()) {
            all = kravRepo.findAll(page);
        } else {
            all = kravRepo.findAllNonUtkast(page);
        }
        return all.map(GenericStorage::getDomainObjectData);
    }

    public Page<Krav> getAllKravStatistics(Pageable page) {
        Page<GenericStorage<Krav>> all = kravRepo.findAll(page);

        return all.map(GenericStorage::getDomainObjectData);
    }

    public List<Krav> getByFilter(KravFilter filter) {
        return convert(kravRepo.findBy(filter), GenericStorage::getDomainObjectData);
    }

    public List<Krav> findByVirkmiddelId(String virkemiddelId) {
        return convert(kravRepo.findByVirkemiddelIder(virkemiddelId), GenericStorage::getDomainObjectData);
    }

    public List<Krav> getByKravNummer(int kravNummer) {
        return convert(kravRepo.findByKravNummer(kravNummer), GenericStorage::getDomainObjectData);
    }

    public Optional<Krav> getByKravNummer(int kravNummer, int kravVersjon) {
        return kravRepo.findByKravNummer(kravNummer, kravVersjon)
                .map(GenericStorage::getDomainObjectData);
    }

    public List<Krav> search(String name) {
        List<GenericStorage<Krav>> byNameContaining = new ArrayList<>(kravRepo.findByNameContaining(name));
        if (StringUtils.isNumeric(name)) {
            byNameContaining.addAll(kravRepo.findByKravNummer(Integer.parseInt(name)));
        }
        if (!isKravEier()) {
            byNameContaining.removeIf(gs -> gs.getDomainObjectData().getStatus().erUtkast());
        }
        return convert(byNameContaining, GenericStorage::getDomainObjectData);
    }

    public List<Krav> searchByNumber(String number) {
        List<GenericStorage<Krav>> byNumberContaining = new ArrayList<>(kravRepo.findByNumberContaining(number));
        if (!isKravEier()) {
            byNumberContaining.removeIf(gs -> gs.getDomainObjectData().getStatus().erUtkast());
        }
        return convert(byNumberContaining, GenericStorage::getDomainObjectData);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Krav save(KravRequest request) {
        Validator.validate(request, storage::get)
                .addValidations(this::validateName)
                .addValidations(this::validateStatus)
                .addValidations(this::validateKravNummerVersjon)
                .addValidations(this::validateBegreper)
                .ifErrorsThrowValidationException();

        var krav = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new Krav();

        krav.merge(request);

        if (request.isNyKravVersjon()) {
            krav.setKravNummer(request.getKravNummer());
            krav.setKravVersjon(kravRepo.nextKravVersjon(request.getKravNummer()));
        } else if (!request.isUpdate()) {
            krav.setKravNummer(kravRepo.nextKravNummer());
        }

        if (krav.getStatus() == KravStatus.AKTIV) {
            if (krav.getKravVersjon() > 1) {
                int olderKravVersjon = krav.getKravVersjon() - 1;
                kravRepo.updateKravToUtgaatt(krav.getKravNummer(), olderKravVersjon);
            }
        }

        if (krav.getId() != null) {
            var previousKrav = storage.get(krav.getId());
            if (Objects.nonNull(previousKrav) && previousKrav.getStatus() != KravStatus.AKTIV && krav.getStatus() == KravStatus.AKTIV) {
                krav.setAktivertDato(LocalDateTime.now());
            }
        } else if (krav.getStatus() == KravStatus.AKTIV) {
            krav.setAktivertDato(LocalDateTime.now());
        }

        return storage.save(krav);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Krav delete(UUID id) {
        return storage.delete(id);
    }

    public List<Krav> findForEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
        return getByFilter(KravFilter.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjonId).build());
    }

    public List<Krav> findForEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId, String virkemiddelId) {
        return getByFilter(KravFilter.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjonId).virkemiddelId(virkemiddelId).build());
    }

    public List<Krav> findForEtterlevelseDokumentasjonIrrelevans(String etterlevelseDokumentasjonId) {
        return getByFilter(KravFilter.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjonId).etterlevelseDokumentasjonIrrevantKrav(true).build());
    }

    public List<Krav> findForEtterlevelseDokumentasjonIrrelevans(String etterlevelseDokumentasjonId, String virkemiddelId) {
        return getByFilter(KravFilter.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjonId).virkemiddelId(virkemiddelId).etterlevelseDokumentasjonIrrevantKrav(true).build());
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public List<KravImage> saveImages(List<KravImage> images) {
        return convert(imageStorage.saveAll(images), GenericStorage::getDomainObjectData);
    }

    public KravImage getImage(UUID kravId, UUID fileId) {
        return kravRepo.findKravImage(kravId, fileId).getDomainObjectData();
    }

    private void validateName(Validator<KravRequest> validator) {
        String name = validator.getItem().getNavn();
        if (name == null) {
            return;
        }
        var items = filter(storage.findByNameAndType(name, Krav.class), t -> !t.getId().equals(validator.getItem().getIdAsUUID()));
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
        Krav oldKrav = validator.<Krav>getDomainItem();
        if (req.getStatus() == KravStatus.UTKAST && oldKrav.getStatus() != KravStatus.UTKAST) {
            var etterlevelser = etterlevelseRepo.findByKravNummer(oldKrav.getKravNummer(), oldKrav.getKravVersjon());
            if (!etterlevelser.isEmpty()) {
                validator.addError(Fields.status, "INVALID_STATUS", "Krav already contains %d etterlevelser, cannot change status to UTKAST".formatted(etterlevelser.size()));
            }
        }
    }

    private void validateBegreper(Validator<KravRequest> validator) {
        var existingBegreper = Optional.ofNullable(validator.<Krav>getDomainItem()).map(Krav::getBegrepIder).orElse(List.of());
        validator.getItem().getBegrepIder().stream()
                .filter(b -> !existingBegreper.contains(b))
                .filter(b -> begrepService.getBegrep(b).isEmpty())
                .forEach(b -> validator.addError(Fields.begrepIder, "BEGREP_NOT_FOUND", "Begrep %s ble ikke funnet i begrepskatalogen.".formatted(b)));
    }

    @SchedulerLock(name = "clean_krav_images", lockAtLeastFor = "PT5M")
    @Scheduled(initialDelayString = "PT5M", fixedRateString = "PT1H")
    @Transactional(propagation = Propagation.REQUIRED)
    public void cleanupImages() {
        var deletes = kravRepo.cleanupImages();
        log.info("Deleted {} unused krav images", deletes);
    }
}
