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
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.behandling.domain.BehandlingData;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.kravprioritering.domain.KravPrioritering;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.etterlevelse.virkemiddel.domain.Virkemiddel;
import org.hibernate.annotations.Type;
import org.springframework.util.Assert;

import java.util.Collection;
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
public class GenericStorage extends Auditable {

    @Id
    @Column(name = "ID")
    private UUID id;

    @NotNull
    @Column(name = "TYPE", nullable = false, updatable = false)
    private String type;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    private JsonNode data;

    @Transient
    @JsonIgnore
    private transient DomainObject domainObjectCache;

    public GenericStorage generateId() {
        Assert.isTrue(id == null, "id already set");
        id = UUID.randomUUID();
        return this;
    }

    public <T extends DomainObject> GenericStorage setDomainObjectData(T object) {
        Assert.isTrue(id != null, "id not set");
        Assert.isTrue(type == null || object.type().equals(type), "cannot change object type");
        object.setId(id);
        type = object.type();
        data = JsonUtils.toJsonNode(object);
        domainObjectCache = object;
        return this;
    }

    @SuppressWarnings("unchecked")
    public <T extends DomainObject> T getDomainObjectData(Class<T> clazz) {
        validateType(clazz);
        if (domainObjectCache == null) {
            domainObjectCache = JsonUtils.toObject(data, clazz);
        }
        domainObjectCache.setChangeStamp(new ChangeStamp(getCreatedBy(), getCreatedDate(), getLastModifiedBy(), getLastModifiedDate()));
        domainObjectCache.setVersion(getVersion());
        return (T) domainObjectCache;
    }

    public <T extends DomainObject> void validateType(Class<T> clazz) {
        Assert.isTrue(type.equals(TypeRegistration.typeOf(clazz)), "Incorrect type");
    }

    public MailLog toMailLog() {
        return getDomainObjectData(MailLog.class);
    }

    public static <T extends DomainObject> List<T> getOfType(Collection<GenericStorage> storages, Class<T> type) {
        return convert(StreamUtils.filter(storages, r -> r.getType().equals(TypeRegistration.typeOf(type))), gs -> gs.getDomainObjectData(type));
    }

    public static <T extends DomainObject> List<T> to(List<GenericStorage> collection, Class<T> type) {
        return convert(collection, item -> item.getDomainObjectData(type));
    }

    public Krav toKrav() {
        return getDomainObjectData(Krav.class);
    }

    public KravPrioritering toKravPrioritering() {
        return getDomainObjectData(KravPrioritering.class);
    }

    public Etterlevelse toEtterlevelse() {
        return getDomainObjectData(Etterlevelse.class);
    }

    public BehandlingData toBehandlingData() {
        return getDomainObjectData(BehandlingData.class);
    }

    public EtterlevelseMetadata toEtterlevelseMetadata() {
        return getDomainObjectData(EtterlevelseMetadata.class);
    }

    public Melding toMelding() {
        return getDomainObjectData(Melding.class);
    }

    public EtterlevelseArkiv toEtterlevelseArkiv() {return getDomainObjectData(EtterlevelseArkiv.class); }

    public EtterlevelseDokumentasjon toEtterlevelseDokumentasjon() {return getDomainObjectData(EtterlevelseDokumentasjon.class); }

    public Virkemiddel toVirkemiddel() {return getDomainObjectData(Virkemiddel.class);}

    /**
     * Edit object and update data on entity
     */
    public <T extends DomainObject> void asType(Consumer<T> consumer, Class<T> type) {
        var object = getDomainObjectData(type);
        consumer.accept(object);
        setDomainObjectData(object);
    }
}
