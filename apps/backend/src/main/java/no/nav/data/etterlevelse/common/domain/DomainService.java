package no.nav.data.etterlevelse.common.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityListRepo;
import no.nav.data.etterlevelse.melding.domain.MeldingRepo;
import no.nav.data.integration.begrep.BegrepService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

@RequiredArgsConstructor
public class DomainService<T extends DomainObject> {

    @Autowired
    protected StorageService<T> storage;
    @Autowired
    protected KravPriorityListRepo kravPriorityListRepo;
    @Autowired
    protected BegrepService begrepService;
    @Autowired
    protected MeldingRepo meldingRepo;

    public T get(UUID uuid) {
        return storage.get(uuid);
    }

}
