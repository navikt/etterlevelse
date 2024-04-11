package no.nav.data;

import no.nav.data.IntegrationTestBase.Initializer;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivService;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelsemetadata.EtterlevelseMetadataService;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityList;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.integration.behandling.BehandlingService;
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

@ActiveProfiles("test")
@ExtendWith(WiremockExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {AppStarter.class, TestConfig.class})
@ContextConfiguration(initializers = {Initializer.class})
public abstract class IntegrationTestBase {

    private static final PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:12");

    static {
        postgreSQLContainer.start();
    }

    @Autowired
    protected TestRestTemplate restTemplate;
    @Autowired
    protected GenericStorageRepository<?> repository;
    @Autowired
    protected AuditVersionRepository auditVersionRepository;
    @Autowired
    protected StorageService<Krav> kravStorageService;
    @Autowired
    protected StorageService<KravPriorityList> kravPriorityListStorageService;
    @Autowired
    protected StorageService<KravImage> kravImageStorageService;
    @Autowired
    protected StorageService<Etterlevelse> etterlevelseStorageService;
    @Autowired
    protected StorageService<EtterlevelseArkiv> etterlevelseArkivStorageService;
    @Autowired
    protected StorageService<EtterlevelseMetadata> etterlevelseMetadataStorageService;
    @Autowired
    protected StorageService<EtterlevelseDokumentasjon> etterlevelseDokumentasjonStorageService;
    @Autowired
    protected StorageService<Melding> meldingStorageService;
    @Autowired
    protected StorageService<Tilbakemelding> tilbakemeldingStorageService;
    @Autowired
    protected JdbcTemplate jdbcTemplate;
    @Autowired
    protected BehandlingService behandlingService;
    @Autowired
    protected EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    @Autowired
    protected EtterlevelseService etterlevelseService;
    @Autowired
    protected EtterlevelseMetadataService etterlevelseMetadataService;
    @Autowired
    protected EtterlevelseArkivService etterlevelseArkivService;

    @BeforeEach
    void setUpBase() {
        repository.deleteAll();
        auditVersionRepository.deleteAll();
        CodelistStub.initializeCodelist();
    }

    @AfterEach
    void tearDownBase() {
        repository.deleteAll();
        MockFilter.clearUser();
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
