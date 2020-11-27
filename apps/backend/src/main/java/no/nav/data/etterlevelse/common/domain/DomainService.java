package no.nav.data.etterlevelse.common.domain;

import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public class DomainService<T extends DomainObject> {

    protected final StorageService storage;
    protected final Class<T> type;

    public DomainService(StorageService storage, Class<T> type) {
        this.storage = storage;
        this.type = type;
    }

    public T get(UUID uuid) {
        return storage.get(uuid, type);
    }

    public Page<T> getAll(Pageable pageable) {
        return storage.getAll(type, pageable);
    }

}
