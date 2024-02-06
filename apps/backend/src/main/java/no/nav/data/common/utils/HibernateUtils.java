package no.nav.data.common.utils;

import no.nav.data.common.exceptions.TechnicalException;
import org.hibernate.proxy.HibernateProxy;
import org.hibernate.proxy.LazyInitializer;
import org.springframework.data.util.ReflectionUtils;

import java.util.UUID;

public final class HibernateUtils {

    private HibernateUtils() {
    }

    /**
     * Get id without loading the entity
     */
    public static UUID getId(Object entity) {
        if (entity instanceof HibernateProxy hp) {
            LazyInitializer lazyInitializer = hp.getHibernateLazyInitializer();
            if (lazyInitializer.isUninitialized()) {
                return (UUID) lazyInitializer.getIdentifier();
            }
        }
        try {
            return (UUID) ReflectionUtils.findRequiredMethod(entity.getClass(), "getId").invoke(entity);
        } catch (Exception e) {
            throw new TechnicalException("id error", e);
        }
    }

}
