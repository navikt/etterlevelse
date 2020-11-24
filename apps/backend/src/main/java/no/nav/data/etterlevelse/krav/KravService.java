package no.nav.data.etterlevelse.krav;

import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravRequest.Fields;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.validator.Validator.ALREADY_EXISTS;

@Service
public class KravService extends DomainService<Krav> {

    private final KravRepo repo;

    public KravService(StorageService storage, KravRepo repo) {
        super(storage, Krav.class);
        this.repo = repo;
    }

    public List<Krav> getByKravNummer(Integer kravNummer) {
        return GenericStorage.to(repo.findByKravNummer(kravNummer), Krav.class);
    }

    public Krav save(KravRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateName)
                .addValidations(this::validateKravNummer)
                .ifErrorsThrowValidationException();

        var krav = request.isUpdate() ? storage.get(request.getIdAsUUID(), Krav.class) : new Krav();
        krav.convert(request);
        if (request.isNyKravVersjon()) {
            krav.setKravNummer(request.getKravNummer());
            krav.setKravVersjon(repo.nextKravVersjon(request.getKravNummer()));
        } else if (!request.isUpdate()) {
            krav.setKravNummer(repo.nextKravNummer());
        }

        return storage.save(krav);
    }

    public List<Krav> search(String name) {
        return convert(repo.findByNameContaining(name), GenericStorage::toKrav);
    }

    public Krav delete(UUID id) {
        return storage.delete(id, Krav.class);
    }

    private void validateName(Validator<KravRequest> validator) {
        String name = validator.getItem().getNavn();
        if (name == null) {
            return;
        }
        var items = filter(storage.findByNameAndType(name, validator.getItem().getRequestType()), t -> !t.getId().equals(validator.getItem().getIdAsUUID()));
        if (!items.isEmpty()) {
            validator.addError("name", ALREADY_EXISTS, "name '" + name + "' already in use");
        }
    }

    private void validateKravNummer(Validator<KravRequest> validator) {
        KravRequest req = validator.getItem();
        if (req.isNyKravVersjon() && req.getKravNummer() != null) {
            if (getByKravNummer(req.getKravNummer()).isEmpty()) {
                validator.addError(Fields.kravNummer, Validator.DOES_NOT_EXIST, "KravNummer %d does not exist".formatted(req.getKravNummer()));
            }
        }
    }
}
