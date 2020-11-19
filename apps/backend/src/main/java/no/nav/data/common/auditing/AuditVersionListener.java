package no.nav.data.common.auditing;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.PropertyWriter;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.HibernateUtils;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.MdcUtils;
import org.hibernate.proxy.HibernateProxy;
import org.springframework.util.Assert;

import java.util.Optional;
import java.util.UUID;
import javax.persistence.Entity;
import javax.persistence.PrePersist;
import javax.persistence.PreRemove;
import javax.persistence.PreUpdate;

import static no.nav.data.common.storage.domain.TypeRegistration.isAudited;

@Slf4j
public class AuditVersionListener {

    private static AuditVersionRepository repository;

    private static final ObjectWriter wr;

    static {
        FilterProvider filters = new SimpleFilterProvider().addFilter("relationFilter", new RelationFilter());
        var om = JsonUtils.createObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, Visibility.NONE);
        om.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
        wr = om.writer(filters);
    }

    public static void setRepo(AuditVersionRepository repository) {
        AuditVersionListener.repository = repository;
    }

    @PrePersist
    public void prePersist(Object entity) {
        audit(entity, Action.CREATE);
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        audit(entity, Action.UPDATE);
    }

    @PreRemove
    public void preRemove(Object entity) {
        audit(entity, Action.DELETE);
    }

    private void audit(Object entity, Action action) {
        Assert.isTrue(entity instanceof Auditable, "Invalid object");
        if (entity instanceof GenericStorage gs && !isAudited((gs).getType())) {
            return;
        }
        AuditVersion auditVersion = convertAuditVersion(entity, action);
        if (auditVersion != null) {
            repository.save(auditVersion);
        }
    }

    public static AuditVersion convertAuditVersion(Object entity, Action action) {
        try {
            String tableName;
            if (entity instanceof GenericStorage gs) {
                tableName = gs.getType();
            } else {
                tableName = AuditVersion.tableName(((Auditable) entity).getClass());
            }
            String id = getIdForObject(entity);
            String data = wr.writeValueAsString(entity);
            String user = Optional.ofNullable(MdcUtils.getUser()).orElse("no user set");
            return AuditVersion.builder()
                    .action(action).table(tableName).tableId(id).data(data).user(user)
                    .build();
        } catch (JsonProcessingException e) {
            log.error("failed to serialize object", e);
            return null;
        }
    }

    public static String getIdForObject(Object entity) {
        UUID uuid = HibernateUtils.getId(entity);
        Assert.notNull(uuid, "entity has not set id");
        return uuid.toString();
    }

    private static class RelationFilter extends SimpleBeanPropertyFilter {

        @Override
        public void serializeAsField(Object pojo, JsonGenerator jgen, SerializerProvider provider, PropertyWriter writer) throws Exception {
            boolean root = jgen.getOutputContext().getParent().getParent() == null;
            boolean isEntity = pojo.getClass().isAnnotationPresent(Entity.class) || pojo instanceof HibernateProxy;
            if (root || !isEntity) {
                super.serializeAsField(pojo, jgen, provider, writer);
            } else {
                String fieldName = writer.getName();
                if (fieldName.equals("id")) {
                    UUID id = HibernateUtils.getId(pojo);
                    jgen.writeFieldName(fieldName);
                    jgen.writeString(id.toString());
                }
            }
        }
    }
}
