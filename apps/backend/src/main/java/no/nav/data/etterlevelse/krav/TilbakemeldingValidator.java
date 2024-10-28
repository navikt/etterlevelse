package no.nav.data.etterlevelse.krav;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.dto.CreateTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.KravRequest.Fields;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TilbakemeldingValidator {

    private final KravRepo kravRepo;

    public void validate(CreateTilbakemeldingRequest request) {
        Validator.validate(request)
                .addValidations(this::validateKravNummer)
                .ifErrorsThrowValidationException();
    }

    private Optional<Krav> validateKravNummer(Validator<CreateTilbakemeldingRequest> validator) {
        Integer kravNummer = validator.getItem().getKravNummer();
        Integer kravVersjon = validator.getItem().getKravVersjon();
        if (kravNummer != null && kravVersjon != null) {
            Optional<GenericStorage<Krav>> krav = kravRepo.findByKravNummer(kravNummer, kravVersjon);
            if (krav.isEmpty()) {
                validator.addError(Fields.kravNummer, Validator.DOES_NOT_EXIST, "KravNummer %d KravVersjon %d does not exist".formatted(kravNummer, kravVersjon));
            } else {
                return krav.map(GenericStorage::getDomainObjectData);
            }
        }
        return Optional.empty();
    }

}
