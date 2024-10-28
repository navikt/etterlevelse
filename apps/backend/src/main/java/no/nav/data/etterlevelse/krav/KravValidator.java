package no.nav.data.etterlevelse.krav;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravRequest.Fields;
import no.nav.data.integration.begrep.BegrepService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Component
@RequiredArgsConstructor
public class KravValidator {

    private final StorageService<Krav> storage;
    private final KravService kravService;
    private final EtterlevelseRepo etterlevelseRepo;
    private final BegrepService begrepService;

    public void validate(KravRequest request) {
        Validator.validate(request, storage::get)
                .addValidations(this::validateName)
                .addValidations(this::validateStatus)
                .addValidations(this::validateKravNummerVersjon)
                .addValidations(this::validateBegreper)
                .ifErrorsThrowValidationException();
    }
    
    private void validateName(Validator<KravRequest> validator) {
        String name = validator.getItem().getNavn();

        if (name == null) {
            return;
        }

        var items = filter(storage.findByNameAndType(name, Krav.class),
                t -> (!t.getId().equals(validator.getItem().getIdAsUUID())
                && !t.getKravNummer().equals(validator.getItem().getKravNummer())
                ));

        if (!items.isEmpty()) {
            validator.addError(Fields.navn, Validator.ALREADY_EXISTS, "name '%s' already in use".formatted(name));
        }
    }

    private void validateKravNummerVersjon(Validator<KravRequest> validator) {
        KravRequest req = validator.getItem();
        Integer kravNummer = req.getKravNummer();
        boolean nyKravVersjon = req.isNyKravVersjon();
        if (nyKravVersjon && kravNummer != null) {
            if (kravService.getByKravNummer(kravNummer).isEmpty()) {
                validator.addError(Fields.kravNummer, Validator.DOES_NOT_EXIST, "KravNummer %d does not exist".formatted(kravNummer));
            }
        }
    }

    private void validateStatus(Validator<KravRequest> validator) {
        KravRequest req = validator.getItem();
        if (!req.isUpdate()) {
            return;
        }
        Krav oldKrav = validator.getDomainItem();
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

}
