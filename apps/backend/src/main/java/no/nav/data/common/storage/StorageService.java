package no.nav.data.common.storage;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.common.storage.domain.TypeRegistration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Service
@RequiredArgsConstructor
public class StorageService<T extends DomainObject> {

    private final GenericStorageRepository<T> repository;

    public T get(UUID uuid) {
        if (uuid == null || !exists(uuid)) return null; 
        return getStorage(uuid).getDomainObjectData();
    }

    /**
     * Batch save, does not work for existing objects
     */
    @Transactional
    public List<GenericStorage<T>> saveAll(Collection<T> objects) {
        Assert.isTrue(objects.stream().noneMatch(o -> o.getId() != null), "Cannot use saveAll on existing object");
        var storages = convert(objects, o -> new GenericStorage<T>().generateId().setDomainObjectData(o));
        List<GenericStorage<T>> storageList = repository.saveAll(storages);
        repository.flush();
        return storageList;
    }

    @Transactional
    public T save(T object) {
        GenericStorage<T> storage = object.getId() != null ? (GenericStorage<T>) getStorage(object.getId()) : new GenericStorage<T>().generateId();
        storage.setDomainObjectData(object);
        GenericStorage<T> saved = repository.save(storage);
        repository.flush();
        return saved.getDomainObjectData();
    }

    @Transactional
    public void deleteAll(List<T> objects) {
        repository.deleteAll(convert(objects, DomainObject::getId));
    }

    private GenericStorage<T> getStorage(UUID uuid) {
        GenericStorage<T> storage = repository.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find GenericStorage with id " + uuid));
        return storage;
    }

    public boolean exists(UUID uuid) {
        return repository.existsById(uuid);
    }

    @Transactional
    public T delete(T item) {
        repository.deleteById(item.getId());
        return item;
    }

    @Transactional
    public T delete(UUID id) {
        var storage = getStorage(id);
        repository.delete(storage);
        return storage.getDomainObjectData();
    }

    // TODO: getAll(...) 
    // Metodene er kilder til feil (kan potensielt returnere veldig mye data). De bør derfor fjernes og evt. erstattes av 
    // metoder kun for de typene vi trenger dette for (f.eks. findAllMailTasks)

    public List<T> getAll(Class<T> type) {
        return convert(repository.findAllByType(TypeRegistration.typeOf(type)), GenericStorage::getDomainObjectData);
    }

    public Page<T> getAll(Class<T> type, Pageable pageable) {
        return repository.findAllByType(TypeRegistration.typeOf(type), pageable).map(GenericStorage::getDomainObjectData);
    }

    public List<T> findByNameAndType(String name, Class<T> type) {
         return convert(repository.findByNameAndType(name, type.getSimpleName()), GenericStorage::getDomainObjectData);
    }
}
