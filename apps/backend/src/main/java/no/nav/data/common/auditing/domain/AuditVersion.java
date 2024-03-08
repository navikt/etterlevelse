package no.nav.data.common.auditing.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.auditing.dto.AuditResponse;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.common.utils.JsonUtils;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@FieldNameConstants
@Table(name = "AUDIT_VERSION")
public class AuditVersion {

    @Id
    @Column(name = "AUDIT_ID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Enumerated(EnumType.STRING)
    @Column(name = "ACTION", nullable = false, updatable = false)
    private Action action;

    // This is the type of the audited entity. See tableNameFor(...) to be slightly less confused.
    @Column(name = "TABLE_NAME", nullable = false, updatable = false)
    private String table;

    @Column(name = "TABLE_ID", nullable = false, updatable = false)
    private String tableId;

    @Column(name = "TIME", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime time = LocalDateTime.now();

    @Column(name = "USER_ID", nullable = false, updatable = false)
    private String user;

    @Column(name = "VERSION", nullable = false, updatable = false)
    private Integer version;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false, updatable = false)
    private String data;

    @Transient
    private transient DomainObject domainObjectCache;

    @SuppressWarnings("unchecked")
    public <T extends DomainObject> T getDomainObjectData(Class<T> type) {
        if (!table.equals(TypeRegistration.typeOf(type))) {
            throw new ValidationException("Invalid type for audit" + type);
        }
        if (domainObjectCache == null) {
            var genStorage = JsonUtils.toObject(data, GenericStorage.class);
            domainObjectCache = JsonUtils.toObject(genStorage.getData(), type);
        }
        return (T) domainObjectCache;
    }

    public AuditResponse toResponse() {
        return AuditResponse.builder()
                .id(id.toString())
                .action(action)
                .table(table)
                .tableId(tableId)
                .time(time)
                .user(user)
                .data(JsonUtils.toJsonNode(this.data))
                .build();
    }

    public static String tableNameFor(Object entity) {
        if (entity instanceof GenericStorage gs) {
            return gs.getType();
        } else if (entity instanceof Auditable au) {
            return au.getClass().getAnnotation(Table.class).name();
        }
        throw new IllegalArgumentException("Should not audit entities of type " + entity.getClass().getSimpleName());
    }

}
