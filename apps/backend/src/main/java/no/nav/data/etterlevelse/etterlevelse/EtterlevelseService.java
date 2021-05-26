package no.nav.data.etterlevelse.etterlevelse;

import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest.Fields;
import org.springframework.data.domain.Page;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.groupBy;


@Service
public class EtterlevelseService extends DomainService<Etterlevelse> {

    private final EtterlevelseRepo repo;

    public EtterlevelseService(EtterlevelseRepo repo) {
        super(Etterlevelse.class);
        this.repo = repo;
    }

    Page<Etterlevelse> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::toEtterlevelse);
    }

    public List<Etterlevelse> getByKravNummer(int kravNummer) {
        return GenericStorage.to(repo.findByKravNummer(kravNummer), Etterlevelse.class);
    }

    public List<Etterlevelse> getByKravNummer(int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByKravNummer(kravNummer);
        }
        return GenericStorage.to(repo.findByKravNummer(kravNummer, kravVersjon), Etterlevelse.class);
    }

    public List<Etterlevelse> getByBehandling(String behandlingId) {
        return GenericStorage.to(repo.findByBehandling(behandlingId), Etterlevelse.class);
    }

    public Map<String, List<Etterlevelse>> getByBehandlinger(Collection<String> behandlingIds) {
        return groupBy(GenericStorage.to(repo.findByBehandlinger(new ArrayList<>(behandlingIds)), Etterlevelse.class), Etterlevelse::getBehandlingId);
    }

    public Etterlevelse save(EtterlevelseRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateKrav)
                .ifErrorsThrowValidationException();

        var etterlevelse = request.isUpdate() ? storage.get(request.getIdAsUUID(), Etterlevelse.class) : new Etterlevelse();
        etterlevelse.convert(request);

        return storage.save(etterlevelse);
    }

    public Etterlevelse delete(UUID id) {
        return storage.delete(id, Etterlevelse.class);
    }

    private void validateKrav(Validator<EtterlevelseRequest> validator) {
        validateKravNummer(validator).ifPresent(krav -> {
            if (!validator.getItem().isUpdate() && !krav.getStatus().kanEtterleves()) {
                validator.addError(Fields.kravNummer, "FEIL_KRAVSTATUS", "Krav %s kan ikke ettereleves med status %s".formatted(
                        krav.kravId(), krav.getStatus()
                ));
            }
        });
    }

}
