package no.nav.data.common.auditing;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.PropertyWriter;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.HibernateUtils;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.MdcUtils;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import org.hibernate.proxy.HibernateProxy;
import org.springframework.util.Assert;

import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.storage.domain.TypeRegistration.isAudited;

@Slf4j
public class AuditVersionListener {

    private static AuditVersionRepository repository;

    private static final ObjectWriter wr;

    static {
        FilterProvider filters = new SimpleFilterProvider().addFilter("relationFilter", new RelationFilter());
        ObjectMapper om = JsonUtils.createObjectMapper();
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
        if (entity instanceof GenericStorage gs && !isAudited(gs.getType())) {
            return;
        }
        AuditVersion auditVersion = convertAuditVersion(entity, action);
        if (auditVersion != null) {
            repository.save(auditVersion);
        }
    }

    public static AuditVersion convertAuditVersion(Object entity, Action action) {
        try {
            String tableName = AuditVersion.tableNameFor(entity);
            int version;
            if (entity instanceof GenericStorage gs) {
                version = gs.getVersion() == null ? 0 : gs.getVersion() + 1;
            } else {
                version = -1;
            }
            String id = getIdForObject(entity);
            String data = wr.writeValueAsString(entity);
            String user = Optional.ofNullable(MdcUtils.getUser()).orElse("no user set");
            return AuditVersion.builder()
                    .action(action).table(tableName).tableId(id).data(data).user(user).version(version)
                    .build();
        } catch (JsonProcessingException e) {
            log.error("failed to serialize object", e);
            return null;
        }
    }

    public static String getIdForObject(Object entity) {
        if (entity instanceof Codelist codelist) {
            return codelist.getList() + "-" + codelist.getCode();
        }
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
