package no.nav.data;

import no.nav.data.IntegrationTestBase.Initializer;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.common.utils.SpringUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopRepo;
import no.nav.data.etterlevelse.codelist.CodelistStub;
import no.nav.data.etterlevelse.documentRelation.DocumentRelationService;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelationRepository;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.EtterlevelseMetadataService;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadataData;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadataRepo;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.*;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityList;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfangRepo;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentData;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.pvotilbakemelding.domain.*;
import no.nav.data.pvk.risikoscenario.RisikoscenarioService;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioData;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioRepo;
import no.nav.data.pvk.tiltak.TiltakService;
import no.nav.data.pvk.tiltak.domain.TiltakRepo;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ApplicationListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ActiveProfiles("test")
@ExtendWith(WiremockExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {AppStarter.class, TestConfig.class})
@ContextConfiguration(initializers = {Initializer.class})
public abstract class IntegrationTestBase {

    private static final PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:16");

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
    protected DocumentRelationRepository dokumentRelasjonRepository;
    @Autowired
    protected KravService kravService;
    @Autowired
    protected KravRepo kravRepo;
    @Autowired
    protected StorageService<KravPriorityList> kravPriorityListStorageService;
    @Autowired
    protected StorageService<KravImage> kravImageStorageService;
    @Autowired
    protected EtterlevelseMetadataRepo etterlevelseMetadataRepo;
    @Autowired
    protected StorageService<Melding> meldingStorageService;
    @Autowired
    protected JdbcTemplate jdbcTemplate;
    @Autowired
    protected BehandlingService behandlingService;
    @Autowired
    protected EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    @Autowired
    protected EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    @Autowired
    protected EtterlevelseService etterlevelseService;
    @Autowired
    protected EtterlevelseMetadataService etterlevelseMetadataService;
    @Autowired
    protected DocumentRelationService documentRelationService;
    @Autowired
    protected EtterlevelseRepo etterlevelseRepo;
    @Autowired
    protected PvkDokumentRepo pvkDokumentRepo;
    @Autowired
    protected PvkDokumentService pvkDokumentService;
    @Autowired
    protected PvoTilbakemeldingRepo pvoTilbakemeldingRepo;
    @Autowired
    protected PvoTilbakemeldingService pvoTilbakemeldingService;
    @Autowired
    protected TiltakRepo tiltakRepo;
    @Autowired
    protected TiltakService tiltakService;
    @Autowired
    protected BehandlingensLivslopRepo behandlingensLivslopRepo;
    @Autowired
    protected BehandlingensLivslopService behandlingensLivslopService;
    @Autowired
    protected RisikoscenarioService risikoscenarioService;
    @Autowired
    protected RisikoscenarioRepo risikoscenarioRepo;
    @Autowired
    protected TilbakemeldingRepo tilbakemeldingRepo;
    @Autowired
    protected BehandlingensArtOgOmfangRepo behandlingensArtOgOmfangRepo;

    @BeforeEach
    @Transactional
    void setUpBase() {
        repository.deleteAll();
        auditVersionRepository.deleteAll();
        CodelistStub.initializeCodelist();
    }

    @AfterEach
    @Commit
    @Transactional
    void tearDownBase() {
        etterlevelseMetadataRepo.deleteAll();
        tilbakemeldingRepo.deleteAll();
        repository.deleteAll();
        MockFilter.clearUser();
        etterlevelseRepo.deleteAll();
        behandlingensLivslopRepo.deleteAll();
        tiltakRepo.deleteAllTiltakRisikoscenarioRelations();
        tiltakRepo.deleteAll();
        risikoscenarioRepo.deleteAll();
        pvoTilbakemeldingRepo.deleteAll();
        pvkDokumentRepo.deleteAll();
        dokumentRelasjonRepository.deleteAll();
        behandlingensArtOgOmfangRepo.deleteAll();
        etterlevelseDokumentasjonRepo.deleteAll();
        kravRepo.deleteAll();
    }

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
            configurableApplicationContext.addApplicationListener(new AppListener());
            TestPropertyValues.of(
                    "spring.datasource.url=" + postgreSQLContainer.getJdbcUrl(),
                    "spring.datasource.username=" + postgreSQLContainer.getUsername(),
                    "spring.datasource.password=" + postgreSQLContainer.getPassword(),
                    "wiremock.server.port=" + WiremockExtension.getWiremock().port()
            ).applyTo(configurableApplicationContext.getEnvironment());
        }
    }

    public static PvoTilbakemelding buildPvoTilbakemelding(UUID pvkDokumentId) {
        return PvoTilbakemelding.builder()
                .pvkDokumentId(pvkDokumentId)
                .status(PvoTilbakemeldingStatus.UNDERARBEID)
                .pvoTilbakemeldingData(
                        PvoTilbakemeldingData.builder()
                                .vurderinger(List.of(Vurdering.builder()
                                        .innsendingId(1)
                                        .build()))
                                .build()
                )
        .build();
    }

    public static PvkDokument buildPvkDokument() {
        return PvkDokument.builder()
                .status(PvkDokumentStatus.UNDERARBEID)
                .pvkDokumentData(PvkDokumentData.builder()
                        .ytterligereEgenskaper(List.of())
                        .antallInnsendingTilPvo(1)
                        .build()
                )
                .build();
    }

    public PvkDokument createPvkDokument() {
        EtterlevelseDokumentasjon ettDok = createEtterlevelseDokumentasjon();
        PvkDokument pvkDok = buildPvkDokument();
        pvkDok.setEtterlevelseDokumentId(ettDok.getId());
        return pvkDokumentService.save(pvkDok, false);
    }

    public PvoTilbakemelding createPvoTilbakemelding() {
        UUID pdokId = createPvkDokument().getId();
        return pvoTilbakemeldingService.save(buildPvoTilbakemelding(pdokId), false);
    }

    
    public static Risikoscenario generateRisikoscenario(UUID pvkDokumentId) {
        return Risikoscenario.builder()
                .pvkDokumentId(pvkDokumentId)
                .risikoscenarioData(RisikoscenarioData.builder()
                        .relevanteKravNummer(new ArrayList<Integer>())
                        .build()
                )
                .build();
    }
    
    protected EtterlevelseDokumentasjon createEtterlevelseDokumentasjon() {
        return etterlevelseDokumentasjonService.save(
                EtterlevelseDokumentasjonRequest.builder()
                        .title("test dokumentasjon")
                        .etterlevelseNummer(101) // Note: This will be overwritten
                        .beskrivelse("")
                        .forGjenbruk(false)
                        .teams(List.of("TEST"))
                        .resources(List.of("TEST"))
                        .risikoeiere(List.of(""))
                        .irrelevansFor(List.of(""))
                        .update(false)
                        .behandlerPersonopplysninger(true)
                        .behandlingIds(List.of(""))
                        .prioritertKravNummer(List.of())
                        .varslingsadresser(List.of())
                        .build()
        );
    }
    
    protected EtterlevelseMetadata createEtterlevelseMetadata(int kravNummer, int kravVersjon) {
        UUID etterlevelseDokumentasjonId = createEtterlevelseDokumentasjon().getId();
        return createEtterlevelseMetadata(etterlevelseDokumentasjonId, kravNummer, kravVersjon);
    }

    protected EtterlevelseMetadata createEtterlevelseMetadata(UUID etterlevelseDokumentasjonId, int kravNummer, int kravVersjon) {
        try {
            createKrav("Krav 1", kravNummer, kravVersjon);
        } catch (Exception e) {
            // Ignore (probably created previouysly)
        }
        return etterlevelseMetadataRepo.save(EtterlevelseMetadata.builder()
                .id(UUID.randomUUID())
                .kravNummer(kravNummer).kravVersjon(kravVersjon)
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .data(EtterlevelseMetadataData.builder().build())

                .build()
        );
    }

    protected Krav createKrav(String navn, int kravNummer, int kravVersjon) {
        Krav krav = Krav.builder().id(UUID.randomUUID()).kravNummer(kravNummer).kravVersjon(kravVersjon)
                .data(KravData.builder().navn(navn).status(KravStatus.AKTIV).build())
                .build();
        return kravService.save(krav);
    }

    protected Krav createKrav() {
        return createKrav("Krav 1", 50, 1);
    }

    protected Risikoscenario insertRisikoscenario() {
        PvkDokument pvkDokument = createPvkDokument();
        Krav krav = kravService.save(Krav.builder().id(UUID.randomUUID()).kravNummer(50).kravVersjon(1)
                .data(KravData.builder().navn("Krav 50").regelverk(List.of(Regelverk.builder()
                        .lov("ARKIV").spesifisering("§1").build())).status(KravStatus.AKTIV).build())
                .build());

        Risikoscenario risikoscenario = Risikoscenario.builder()
                .pvkDokumentId(pvkDokument.getId())
                .risikoscenarioData(RisikoscenarioData.builder()
                        .relevanteKravNummer(List.of(krav.getKravNummer()))
                        .build()
                )
                .build();
        return risikoscenarioService.save(risikoscenario, false);
    }

    
    /*
     * Dette er et lite vakkert men nødvendig hæck. Ellers er det ikke sikkert AuditVersionListener.setRepo blir kalt. JpaConfig har kode som kaller
     * AuditVersionListener.setRepo. Men i test er det av ukjent grunn ikke alltid den koden er kjørt før testene kjøres (ca. 2 av 3 ganger), noe som resulterer
     * i NPE. Hæcket må fjernes når det ikke trengs lenger, siden dette er oppførsel som skiller den fra prod (kan teoretisk medføre maskering av bugs).
     * TODO: Fjern dette hæcket når det ikke trengs lenger.
     */
    public static class AppListener implements ApplicationListener<ContextRefreshedEvent> {
    @Override
        public void onApplicationEvent(ContextRefreshedEvent event) {
            ApplicationContext ctx = event.getApplicationContext();
            // AuditVersionListener.setRepo(ctx.getBean(AuditVersionRepository.class));
            new SpringUtils().setApplicationContext(ctx);
        }
    }

}
