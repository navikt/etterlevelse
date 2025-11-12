package no.nav.data.etterlevelse.krav;


import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.auditing.AuditVersionService;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.varsel.UrlGenerator;
import no.nav.data.etterlevelse.varsel.VarselService;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.security.SecurityUtils.isKravEier;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.etterlevelse.varsel.domain.Varsel.Paragraph.VarselUrl.url;

@Slf4j
@Service
@RequiredArgsConstructor
public class KravService {

    private final KravRepo repo;
    private final StorageService<KravImage> imageStorage;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseService etterlevelseService;
    private final UrlGenerator urlGenerator;
    private final VarselService varselService;
    private final AuditVersionService auditVersionService;

    public Krav get(UUID uuid) {
        return repo.findById(uuid).orElse(null);
    }
    
    public Page<Krav> getAll(Pageable page) {
        return repo.findAll(page);
    }

    public Page<Krav> getAllNonUtkast(Pageable page) {
        return repo.findAllNonUtkast(page);
    }

    public Page<Krav> getAllKravStatistics(Pageable page) {
        return repo.findAll(page);
    }

    public List<Krav> getByFilter(KravFilter filter) {
        return repo.findBy(filter);
    }

    public List<Krav> getByKravNummer(int kravNummer) {
        return repo.findByKravNummer(kravNummer);
    }

    public Optional<Krav> getByKravNummer(int kravNummer, int kravVersjon) {
        return repo.findByKravNummerAndKravVersjon(kravNummer, kravVersjon);
    }

    public List<Krav> search(String name) {
        List<Krav> byNameContaining = new ArrayList<>(repo.findByNavnContaining(name));

        if (StringUtils.isNumeric(name)) {
            byNameContaining.addAll(repo.findByKravNummer(Integer.parseInt(name)));
        }

        if (name.matches("[kK]([0-9]*)")) {
            var kravNummer = Integer.parseInt(name.substring(1));
            byNameContaining.addAll(repo.findByKravNummer(kravNummer));
        }

        if (name.matches("[kK]([0-9]*).([0-9]*)")) {
            var parts = name.substring(1).split("\\.");
            var kravNummer = Integer.parseInt(parts[0]);
            var kravVersjon = Integer.parseInt(parts[1]);
            repo.findByKravNummerAndKravVersjon(kravNummer, kravVersjon).ifPresent(byNameContaining::add);
        }

        if (!isKravEier()) {
            byNameContaining.removeIf(k -> k.getStatus().erUtkast());
        }

        return byNameContaining;
    }

    public List<Krav> searchByNumber(String number) {
        List<Krav> byNumberContaining = new ArrayList<>(repo.findByKravNummerContaining(number));
        if (!isKravEier()) {
            byNumberContaining.removeIf(k -> k.getStatus().erUtkast());
        }
        return byNumberContaining;
    }

    public List<Krav> findByKravNummerAndActiveStatus(int kravNummer) {
        return repo.findByKravNummerAndAktiveStatus(kravNummer);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Krav save(Krav krav) {
        return repo.save(krav);
    }
    
    // TODO: Avhengighet til DTO
    @Transactional(propagation = Propagation.REQUIRED)
    public Krav save(KravRequest request) {
        Krav krav = request.isUpdate() ? repo.findById(request.getId()).get() : new Krav();
        krav.merge(request);

        if (request.isNyKravVersjon()) {
            krav.setKravNummer(request.getKravNummer());
            krav.setKravVersjon(repo.nextKravVersjon(request.getKravNummer()));
        } else if (!request.isUpdate()) {
            krav.setKravNummer(repo.nextKravNummer());
        }
        
        if (krav.getId() != null) {
            List<AuditVersion> kravAudits = auditVersionService.getByTableIdAndTimestamp(krav.getId(), LocalDateTime.now());
            KravStatus previousKravStatus = getKravStatus(kravAudits.get(0));
            if (previousKravStatus != KravStatus.AKTIV && krav.getStatus() == KravStatus.AKTIV) {
                krav.setAktivertDato(LocalDateTime.now());
                varsle(krav, krav.getKravVersjon() > 1);
            }
        } else if (krav.getStatus() == KravStatus.AKTIV) {
            krav.setAktivertDato(LocalDateTime.now());
            varsle(krav, krav.getKravVersjon() > 1);
        }

        if (krav.getStatus() == KravStatus.AKTIV) {
            if (krav.getKravVersjon() > 1) {
                int olderKravVersjon = krav.getKravVersjon() - 1;
                repo.updateKravToUtgaatt(krav.getKravNummer(), olderKravVersjon);
            }
        }
        
        if (krav.getId() == null) {
            krav.setId(UUID.randomUUID());
        }
        
        return repo.save(krav);
    }

    private KravStatus getKravStatus(AuditVersion auditVersion) {
        try {
            JsonNode root = JsonUtils.getObjectReader().readTree(auditVersion.getData());
            // The path to status is the same, regardless of what the archived krav is (GenStore vs. Krav)
            String statusText = root.at("/data/status").asText();
            return KravStatus.valueOf(statusText);
        } catch (JacksonException e) {
            log.error("Could not extract Krav.status from json");
            throw new RuntimeException("Could not extract Krav.status from json", e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Krav delete(UUID id) {
        var kravDelete = get(id);
        if (kravDelete == null) {
            return null;
        }
        repo.deleteById(id);
        return kravDelete;
    }

    public List<Krav> findForEtterlevelseDokumentasjon(UUID etterlevelseDokumentasjonId) {
        return getByFilter(KravFilter.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjonId).build());
    }

    public List<Krav> findForEtterlevelseDokumentasjonIrrelevans(UUID etterlevelseDokumentasjonId) {
        return getByFilter(KravFilter.builder().etterlevelseDokumentasjonId(etterlevelseDokumentasjonId).etterlevelseDokumentasjonIrrevantKrav(true).build());
    }
    @Transactional(propagation = Propagation.REQUIRED)
    public List<KravImage> saveImages(List<KravImage> images) {
        return convert(imageStorage.saveAll(images), GenericStorage::getDomainObjectData);
    }

    public KravImage getImage(UUID kravId, UUID fileId) {
        return repo.findKravImage(kravId, fileId).getDomainObjectData();
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public boolean isActiveKrav(Integer kravnummer) {
        return !findByKravNummerAndActiveStatus(kravnummer).isEmpty();
    }

    @SchedulerLock(name = "clean_krav_images", lockAtLeastFor = "PT5M")
    @Scheduled(initialDelayString = "PT5M", fixedRateString = "PT1H")
    @Transactional(propagation = Propagation.REQUIRED)
    public void cleanupImages() {
        var deletes = repo.cleanupImages();
        log.info("Deleted {} unused krav images", deletes);
    }

    private void varsle(Krav krav, boolean isNewVersion) {
        List<EtterlevelseDokumentasjon> relevanteDokumentasjon = getDocumentForKrav(krav, isNewVersion);
        Codelist tema = CodelistService.getCodelistTemaFromLov(krav.getRegelverk().get(0).getLov());

        relevanteDokumentasjon.forEach(e -> {
            if (e.getVarslingsadresser() != null && !e.getVarslingsadresser().isEmpty()) {
                List<Varslingsadresse> recipients = e.getVarslingsadresser();
                String etterlevelseDokumentasjonTittel = "E%s %s".formatted(e.getEtterlevelseNummer(), e.getTitle());
                String kravTittel = "K%s.%s: %s".formatted(krav.getKravNummer(), krav.getKravVersjon(), e.getTitle());
                var varselBuilder = Varsel.builder();
                if (isNewVersion) {
                    varselBuilder.title("Ny versjon på etterlevelseskrav %s ".formatted(kravTittel));
                }  else {
                    varselBuilder.title("Nytt etterlevelseskrav %s".formatted(kravTittel));
                }

                varselBuilder.paragraph(
                        new Varsel.Paragraph("%s \n Det har blitt lagt inn nytt krav i %s under tema %s. Kravet kan være relevant for ditt utfylte etterlevelsesdokument %s",
                                url(urlGenerator.kravUrl(krav.getKravNummer().toString(), krav.getKravVersjon().toString()), "Lenke til kravet"),
                                url(urlGenerator.baseUrl(), "Støtte til Etterlevelse"),
                                url(urlGenerator.temaUrl(tema.getCode()), tema.getShortName()),
                                url(urlGenerator.etterlevelseDokumentasjonUrl(e.getId().toString()),etterlevelseDokumentasjonTittel)
                        )
                );

                varselService.varsle(recipients, varselBuilder.build());
            }
        });
    }

    private List<EtterlevelseDokumentasjon> getDocumentForKrav(Krav krav, boolean isNewVersion) {
        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonList = new ArrayList<>();

        if (isNewVersion) {
            List<UUID> etterlevelseDokumentasjonIds = etterlevelseService.getByKravNummer(krav.getKravNummer(), krav.getKravVersjon() -1 ).stream().map(Etterlevelse::getEtterlevelseDokumentasjonId).toList();
            etterlevelseDokumentasjonIds.forEach(id -> {
                var etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(id);
                etterlevelseDokumentasjonList.add(etterlevelseDokumentasjon);
            });
            return etterlevelseDokumentasjonList;
        } else {
            return etterlevelseDokumentasjonService.findByKravRelevans(krav.getRelevansFor());
        }
    }

}
