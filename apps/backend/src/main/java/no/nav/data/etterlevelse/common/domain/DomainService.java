package no.nav.data.etterlevelse.common.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadataRepo;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.dto.KravRequest.Fields;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityListRepo;
import no.nav.data.etterlevelse.melding.domain.MeldingRepo;
import no.nav.data.etterlevelse.virkemiddel.domain.VirkemiddelRepo;
import no.nav.data.integration.begrep.BegrepService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
public class DomainService<T extends DomainObject> {

    @Autowired
    protected StorageService<T> storage;
    @Autowired
    protected KravRepo kravRepo;
    @Autowired
    protected KravPriorityListRepo kravPriorityListRepo;
    @Autowired
    protected EtterlevelseRepo etterlevelseRepo;
    @Autowired
    protected EtterlevelseMetadataRepo etterlevelseMetadataRepo;
    @Autowired
    protected BegrepService begrepService;
    @Autowired
    protected MeldingRepo meldingRepo;
    @Autowired
    protected EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    @Autowired
    protected VirkemiddelRepo virkemiddelRepo;

    public T get(UUID uuid) {
        return storage.get(uuid);
    }

    protected <R extends KravId & Validated> Optional<Krav> validateKravNummer(Validator<R> validator) {
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
