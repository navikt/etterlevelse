package no.nav.data.common.utils;

import no.nav.data.common.exceptions.TechnicalException;
import org.hibernate.Hibernate;
import org.hibernate.LazyInitializationException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
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
    
    /**
     * Initializes the object, even when it is a detached proxy
     */
    public static <T> T initialize(T input) {
        if (! (input instanceof HibernateProxy)) {
            return input;
        }
        try {
            Hibernate.initialize(input);
            return input;
        } catch (LazyInitializationException e) {
        }
        // We are here probably only if we no longer have the session that was used to get input
        SessionFactory sFac = SpringUtils.getSessionFactory();
        sFac.inSession((Session session) -> {
            session.update(input);
            Hibernate.initialize(input);
        });
        return input;
    }


}
