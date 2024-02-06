package no.nav.data.common.jpa;

import io.prometheus.client.hibernate.HibernateStatisticsCollector;
import jakarta.persistence.EntityManagerFactory;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.AppStarter;
import no.nav.data.common.auditing.AuditVersionListener;
import no.nav.data.common.auditing.AuditorAwareImpl;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.storage.StorageService;
import org.hibernate.SessionFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import static no.nav.data.common.utils.MdcUtils.wrapAsync;

@Slf4j
@EntityScan(basePackageClasses = AppStarter.class)
@EnableJpaRepositories(basePackageClasses = AppStarter.class)
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return new AuditorAwareImpl();
    }

    @Bean
    public ApplicationRunner initAudit(AuditVersionRepository repository) {
        return args -> AuditVersionListener.setRepo(repository);
    }

    @Bean
    @DependsOn("initAudit")
    public ApplicationRunner migrate(StorageService<?> storage) {
        return (args) -> wrapAsync(() -> {
            log.debug("Running migrations");
        }, "Database migration")
                .run();
    }

    @Bean
    public ApplicationRunner initHibernateMetrics(EntityManagerFactory emf) {
        return args -> new HibernateStatisticsCollector(emf.unwrap(SessionFactory.class), "main").register();
    }
}
