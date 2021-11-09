package no.nav.data.common.storage;

import lombok.extern.slf4j.Slf4j;
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

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
@Transactional
public class StorageService {

    private final GenericStorageRepository repository;

    public StorageService(GenericStorageRepository repository) {
        this.repository = repository;
    }


    public <T extends DomainObject> T get(UUID uuid, String type) {
        return get(uuid, TypeRegistration.classFrom(type));

    }

    public <T extends DomainObject> T get(UUID uuid, Class<T> type) {
        return getStorage(uuid, type).getDomainObjectData(type);
    }

    /**
     * Batch save, does not work for existing objects
     */
    public <T extends DomainObject> List<GenericStorage> saveAll(Collection<T> objects) {
        Assert.isTrue(objects.stream().noneMatch(o -> o.getId() != null), "Cannot use saveAll on existing object");
        var storages = convert(objects, o -> new GenericStorage().generateId().setDomainObjectData(o));
        List<GenericStorage> storageList = repository.saveAll(storages);
        repository.flush();
        return storageList;
    }

    public <T extends DomainObject> T save(T object) {
        var storage = object.getId() != null ? getStorage(object.getId(), object.getClass()) : new GenericStorage().generateId();
        storage.setDomainObjectData(object);
        var saved = repository.save(storage);
        // flush to update changestamp and versions
        if(object.getChangeStamp() == null) {
            repository.flush();
        }
        //noinspection unchecked
        return (T) saved.getDomainObjectData(object.getClass());
    }

    public <T extends DomainObject> void deleteAll(List<T> objects) {
        repository.deleteAll(convert(objects, DomainObject::getId));
    }

    private GenericStorage getStorage(UUID uuid, Class<? extends DomainObject> type) {
        GenericStorage storage = repository.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find " + TypeRegistration.typeOf(type) + " with id " + uuid));
        storage.validateType(type);
        return storage;
    }

    public <T extends DomainObject> boolean exists(UUID uuid, Class<T> type) {
        return repository.existsByIdAndType(uuid, TypeRegistration.typeOf(type));
    }

    public boolean exists(UUID uuid, String type) {
        return repository.existsByIdAndType(uuid, type);
    }

    /**
     * Will not throw if object does not exist
     */
    public <T extends DomainObject> void softDelete(UUID id, Class<T> type) {
        repository.deleteByIdAndType(id, TypeRegistration.typeOf(type));
    }

    public <T extends DomainObject> T delete(T item) {
        repository.deleteById(item.getId());
        return item;
    }

    public <T extends DomainObject> T delete(UUID id, Class<T> type) {
        var storage = getStorage(id, type);
        repository.delete(storage);
        return storage.getDomainObjectData(type);
    }

    public <T extends DomainObject> List<T> getAll(Class<T> type) {
        return convert(repository.findAllByType(TypeRegistration.typeOf(type)), gs -> gs.getDomainObjectData(type));
    }

    public <T extends DomainObject> Page<T> getAll(Class<T> type, Pageable pageable) {
        return repository.findAllByType(TypeRegistration.typeOf(type), pageable).map(gs -> gs.getDomainObjectData(type));
    }

    public <T extends DomainObject> List<T> getAllById(Class<T> type, List<UUID> ids) {
        List<GenericStorage> allById = repository.findAllById(ids);
        return convert(allById, gs -> gs.getDomainObjectData(type));
    }

    public <T extends DomainObject> Optional<GenericStorage> getSingleton(Class<T> type) {
        return repository.findByType(TypeRegistration.typeOf(type));
    }

    public long count(Class<? extends DomainObject> aClass) {
        return repository.countByType(TypeRegistration.typeOf(aClass));
    }

    public long deleteCreatedOlderThan(Class<? extends DomainObject> aClass, LocalDateTime time) {
        return repository.deleteByTypeAndCreatedDateBefore(TypeRegistration.typeOf(aClass), time);
    }

    public <T extends DomainObject> List<T> findByNameAndType(String name, String type) {
        return convert(repository.findByNameAndType(name, type), gs -> gs.getDomainObjectData(TypeRegistration.classFrom(type)));
    }
}
