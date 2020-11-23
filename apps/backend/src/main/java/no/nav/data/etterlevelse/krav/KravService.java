package no.nav.data.etterlevelse.krav;

import no.nav.data.common.storage.StorageService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KravService extends DomainService<Krav> {

    public KravService(StorageService storage) {
        super(storage, Krav.class);
    }

    public List<Krav> search(String name) {
        return List.of();
    }

    public Krav save(KravRequest request) {
        return new Krav();
    }

    public Krav delete(UUID id) {
        return new Krav();
    }
}
