package no.nav.data.common.storage.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.common.utils.JsonUtils;
import org.hibernate.annotations.Type;
import org.springframework.util.Assert;

import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;

import static no.nav.data.common.utils.StreamUtils.convert;

@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "GENERIC_STORAGE")
public class GenericStorage<T extends DomainObject> extends Auditable {

    @Id
    @Column(name = "ID")
    private UUID id;

    @NotNull
    @Column(name = "TYPE", nullable = false, updatable = false)
    // Type er getSimpleName() av (sub-) klassen til domeneobjektet. 
    private String type;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    private JsonNode data;

    @Transient
    @JsonIgnore
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private transient T domainObjectCache;

    public GenericStorage<T> generateId() {
        Assert.isTrue(id == null, "id already set");
        id = UUID.randomUUID();
        // TODO: Setter IKKE id på domainObjectCache. Må sjekke at dette er riktig oppførsel
        // Se https://trello.com/c/rP0Ln2zc/358-synkronisering-av-felles-felter-domainobject-vs-genericstorage
        return this;
    }

    /**
     * Merk: Endrer også input domainObject ved å sette id
     */
    public GenericStorage<T> setDomainObjectData(T domainObject) {
        // TODO: Setter IKKE changeStamp på this fra domainObject. Må sjekkes at dette er riktig oppførsel.
        // Se https://trello.com/c/rP0Ln2zc/358-synkronisering-av-felles-felter-domainobject-vs-genericstorage
        Assert.isTrue(id != null, "id not set");
        domainObject.setId(id);
        type = domainObject.type();
        data = JsonUtils.toJsonNode(domainObject);
        domainObjectCache = domainObject;
        return this;
    }

    public T getDomainObjectData() {
        Class<T> clazz = TypeRegistration.classFrom(type);
        if (domainObjectCache == null) {
            domainObjectCache = JsonUtils.toObject(data, clazz);
        }
        domainObjectCache.setChangeStamp(new ChangeStamp(getCreatedBy(), getCreatedDate(), getLastModifiedBy(), getLastModifiedDate()));
        domainObjectCache.setVersion(getVersion());
        return domainObjectCache;
    }

    public static <T extends DomainObject> List<T> convertToDomaionObject(List<GenericStorage<T>> collection) {
        return convert(collection, GenericStorage::getDomainObjectData);
    }
    
    /**
     * Kaller en funksjon med dette objectets T og oppdaterer dette objektet med resultatet
     */
    public void consumeDomainObject(Consumer<T> consumer) {
        T object = getDomainObjectData();
        consumer.accept(object);
        setDomainObjectData(object);
    }
}
