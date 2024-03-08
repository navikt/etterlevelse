package no.nav.data.etterlevelse.virkemiddel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.virkemiddel.domain.Virkemiddel;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelNotErasableException;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Service
@RequiredArgsConstructor
public class VirkemiddelService extends DomainService<Virkemiddel> {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final KravService kravService;

    private void validateVirkemiddelIsNotInUse(UUID virkemiddelId) {
        Virkemiddel virkemiddel = storage.get(virkemiddelId);
        List<String> etterlevelseDokumentasjonList = etterlevelseDokumentasjonService.getByVirkemiddelId(List.of(virkemiddelId.toString())).stream().map((e)-> 'E' + e.getEtterlevelseNummer().toString()).toList();
        List<String> kravList = kravService.findByVirkmiddelId(virkemiddelId.toString()).stream()
                .map((k) -> 'K' + k.getKravNummer().toString() + "." + k.getKravVersjon().toString()).toList();
        List<String> joinedList = Stream.concat(etterlevelseDokumentasjonList.stream(), kravList.stream()).toList();
        if (!joinedList.isEmpty()) {
            log.warn("The virkemiddel {} is in use and cannot be erased. \n Currently in use at: {}", virkemiddel.getNavn(), joinedList);
            throw new VirkemiddelNotErasableException(String.format("The virkemiddel %s is in use and cannot be erased. \n Currently in use at: %s", virkemiddel.getNavn(), joinedList.toString()));
        }
    }

    public Page<Virkemiddel> getAll(Pageable page) {
        return virkemiddelRepo.findAll(page).map(GenericStorage::getDomainObjectData);
    }

    public List<Virkemiddel> search(String name) {
        List<GenericStorage<Virkemiddel>> byNameContaining = new ArrayList<>(virkemiddelRepo.findByNameContaining(name));

        return convert(byNameContaining, GenericStorage::getDomainObjectData);
    }

    public List<Virkemiddel> getByVirkemiddelType(String code) {
        return convert(virkemiddelRepo.findByVirkemiddelType(code), GenericStorage::getDomainObjectData);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Virkemiddel save(VirkemiddelRequest request) {
        Validator.validate(request, storage::get)
                .addValidations(this::validateName)
                .ifErrorsThrowValidationException();

        var virkemiddel = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new Virkemiddel();

        virkemiddel.merge(request);

        return storage.save(virkemiddel);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Virkemiddel delete(UUID id) {
        validateVirkemiddelIsNotInUse(id);
        return storage.delete(id);
    }

    private void validateName(Validator<VirkemiddelRequest> validator) {
        String name = validator.getItem().getNavn();
        if (name == null) {
            return;
        }
        var items = filter(storage.findByNameAndType(name, Virkemiddel.class), t -> !t.getId().equals(validator.getItem().getIdAsUUID()));
        if (!items.isEmpty()) {
            validator.addError(VirkemiddelRequest.Fields.navn, Validator.ALREADY_EXISTS, "name '%s' already in use".formatted(name));
        }
    }

}
