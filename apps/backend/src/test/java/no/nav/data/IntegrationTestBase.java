package no.nav.data;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.IntegrationTestBase.Initializer;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;

@Slf4j
@ActiveProfiles("test")
@ExtendWith(WiremockExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {AppStarter.class})
@ContextConfiguration(initializers = {Initializer.class})
public abstract class IntegrationTestBase {

    private static final PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:12");

    static {
        postgreSQLContainer.start();
    }

    @Autowired
    protected TestRestTemplate restTemplate;
    @Autowired
    protected GenericStorageRepository repository;
    @Autowired
    protected AuditVersionRepository auditVersionRepository;
    @Autowired
    protected StorageService storageService;
    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUpBase() {
        repository.deleteAll();
        auditVersionRepository.deleteAll();
        CodelistStub.initializeCodelist();
    }

    @AfterEach
    void tearDownBase() {
        repository.deleteAll();
    }

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=" + postgreSQLContainer.getJdbcUrl(),
                    "spring.datasource.username=" + postgreSQLContainer.getUsername(),
                    "spring.datasource.password=" + postgreSQLContainer.getPassword(),
                    "wiremock.server.port=" + WiremockExtension.getWiremock().port()
            ).applyTo(configurableApplicationContext.getEnvironment());
        }
    }
}
