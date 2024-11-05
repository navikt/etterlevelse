package no.nav.data.etterlevelse.common.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadataRepo;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityListRepo;
import no.nav.data.etterlevelse.melding.domain.MeldingRepo;
import no.nav.data.etterlevelse.virkemiddel.domain.VirkemiddelRepo;
import no.nav.data.integration.begrep.BegrepService;
import org.springframework.beans.factory.annotation.Autowired;

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

}
