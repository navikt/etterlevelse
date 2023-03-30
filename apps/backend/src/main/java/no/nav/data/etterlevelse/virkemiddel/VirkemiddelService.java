package no.nav.data.etterlevelse.virkemiddel;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.virkemiddel.domain.Virkemiddel;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelNotErasableException;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Service
public class VirkemiddelService extends DomainService<Virkemiddel> {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    public VirkemiddelService(EtterlevelseDokumentasjonService etterlevelseDokumentasjonService) {
        super(Virkemiddel.class);

        this.etterlevelseDokumentasjonService = etterlevelseDokumentasjonService;
    }

    private void validateVirkemiddelIsNotInUse(UUID virkemiddelId) {
        Virkemiddel virkemiddel = storage.get(virkemiddelId, Virkemiddel.class);
        List<String> etterlevelseDokumentasjonList = etterlevelseDokumentasjonService.getByVirkemiddelId(List.of(virkemiddelId.toString())).stream().map((e)-> 'E' + e.getEtterlevelseNummer().toString()).toList();
        //TODO get krav list by virkemiddel id and check if is being used by krav
        if (!etterlevelseDokumentasjonList.isEmpty()) {
            log.warn("The virkemiddel {} is in use and cannot be erased. etterlvelse dokumentasjon: {}", virkemiddel.getNavn(), etterlevelseDokumentasjonList);
            throw new VirkemiddelNotErasableException(String.format("The virkemiddel {} is in use and cannot be erased. etterlvelse dokumentasjon: {}", virkemiddel.getNavn(), etterlevelseDokumentasjonList));
        }
    }

    @Override
    public Page<Virkemiddel> getAll(Pageable page) {
        return virkemiddelRepo.findAll(page).map(GenericStorage::toVirkemiddel);
    }

    public List<Virkemiddel> search(String name) {
        List<GenericStorage> byNameContaining = new ArrayList<>(virkemiddelRepo.findByNameContaining(name));

        return convert(byNameContaining, GenericStorage::toVirkemiddel);
    }

    public List<Virkemiddel> getByVirkemiddelType(String code) {
        return convert(virkemiddelRepo.findByVirkemiddelType(code), GenericStorage::toVirkemiddel);
    }

    public Virkemiddel save(VirkemiddelRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateName)
                .ifErrorsThrowValidationException();

        var virkemiddel = request.isUpdate() ? storage.get(request.getIdAsUUID(), Virkemiddel.class) : new Virkemiddel();

        virkemiddel.convert(request);

        return storage.save(virkemiddel);
    }

    public Virkemiddel delete(UUID id) {
        validateVirkemiddelIsNotInUse(id);
        return storage.delete(id, Virkemiddel.class);
    }

    private void validateName(Validator<VirkemiddelRequest> validator) {
        String name = validator.getItem().getNavn();
        if (name == null) {
            return;
        }
        var items = filter(storage.findByNameAndType(name, validator.getItem().getRequestType()), t -> !t.getId().equals(validator.getItem().getIdAsUUID()));
        if (!items.isEmpty()) {
            validator.addError(VirkemiddelRequest.Fields.navn, Validator.ALREADY_EXISTS, "name '%s' already in use".formatted(name));
        }
    }

}
