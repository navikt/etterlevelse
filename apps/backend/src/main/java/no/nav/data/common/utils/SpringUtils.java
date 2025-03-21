package no.nav.data.common.utils;

import org.hibernate.SessionFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

@Component
public final class SpringUtils implements ApplicationContextAware {

    private static volatile ApplicationContext applicationContext;
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        SpringUtils.applicationContext = applicationContext;
    }
    
    public static <T> T getBean(Class<T> clz) {
        return applicationContext.getBean(clz);
    }

    public static SessionFactory getSessionFactory() {
        return getBean(SessionFactory.class);
    }
    
}
