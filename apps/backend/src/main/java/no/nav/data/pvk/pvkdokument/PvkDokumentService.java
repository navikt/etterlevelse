package no.nav.data.pvk.pvkdokument;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopFil;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.export.EtterlevelseDokumentasjonToDoc;
import no.nav.data.integration.p360.P360Service;
import no.nav.data.integration.p360.dto.P360DocumentCreateRequest;
import no.nav.data.integration.p360.dto.P360File;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentVersion;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentVersionRepo;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.risikoscenario.RisikoscenarioService;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.tiltak.TiltakService;

@Service
@Slf4j
@RequiredArgsConstructor
public class PvkDokumentService {

    private final PvkDokumentRepo pvkDokumentRepo;
    private final PvkDokumentVersionRepo pvkDokumentVersionRepo;
    private final RisikoscenarioService risikoscenarioService;
    private final TiltakService tiltakService;
    private final PvoTilbakemeldingService pvoTilbakemeldingService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final BehandlingensLivslopService behandlingensLivslopService;
    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;
    private final P360Service p360Service;

    public PvkDokument get(UUID uuid) {
        return pvkDokumentRepo.findById(uuid).orElse(null);
    }

    public Page<PvkDokument> getAll(PageParameters pageParameters) {
        return pvkDokumentRepo.findAll(pageParameters.createPage());
    }

    public Optional<PvkDokument> getByEtterlevelseDokumentasjon(UUID etterlevelseDokumentasjonId) {
        return pvkDokumentRepo.findByEtterlevelseDokumensjon(etterlevelseDokumentasjonId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument save(PvkDokument pvkDokument, boolean isUpdate) {
        if (!isUpdate) {
            var existingPvkDokument = getByEtterlevelseDokumentasjon(pvkDokument.getEtterlevelseDokumentId());
            if (existingPvkDokument.isPresent()) {
                log.warn("Found existing pvk document when trying to create for etterlevelse dokumentation id: {}", pvkDokument.getEtterlevelseDokumentId());
                pvkDokument.setId(existingPvkDokument.get().getId());
            } else {
                pvkDokument.setId(UUID.randomUUID());
            }
        }

        return pvkDokumentRepo.save(pvkDokument);
    }

    /**
     * If approved by risikoeier, snapshot current PVK as a version and start a new UNDERARBEID document.
     * Returns the newly created PVK document if a new version was created, otherwise empty.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public Optional<PvkDokument> handleApprovalAndCreateNewVersion(PvkDokument pvkDokument) {
        if (pvkDokument == null) {
            return Optional.empty();
        }

        if (pvkDokument.getStatus() == no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
            log.info("PVK approved by risikoeier, creating version and new working copy for etterlevelseDokumentasjonId={}", pvkDokument.getEtterlevelseDokumentId());

            // snapshot current as version
            // determine next content version number
            var existingVersions = pvkDokumentVersionRepo.findByEtterlevelseDokumentIdOrderByCreatedDateDesc(pvkDokument.getEtterlevelseDokumentId());
            int nextContentVersion = existingVersions.isEmpty() ? 1 : (existingVersions.get(0).getContentVersion() + 1);
            var version = PvkDokumentVersion.builder()
                    .pvkDokumentId(pvkDokument.getId())
                    .etterlevelseDokumentId(pvkDokument.getEtterlevelseDokumentId())
                    .status(pvkDokument.getStatus())
                    .pvkDokumentData(pvkDokument.getPvkDokumentData())
                .contentVersion(nextContentVersion)
                    .build();
            pvkDokumentVersionRepo.save(version);

            // create a fresh working copy
            var freshData = new no.nav.data.pvk.pvkdokument.domain.PvkDokumentData();
            // carry forward some fields that should persist into the next cycle
            freshData.setYtterligereEgenskaper(pvkDokument.getPvkDokumentData().getYtterligereEgenskaper());
            freshData.setBerOmNyVurderingFraPvo(false);
            freshData.setMeldingerTilPvo(java.util.Collections.emptyList());
            freshData.setAntallInnsendingTilPvo(0);
            // clear risikoeier approval meta
            freshData.setGodkjentAvRisikoeier(null);
            freshData.setGodkjentAvRisikoeierDato(null);

            var newPvk = no.nav.data.pvk.pvkdokument.domain.PvkDokument.builder()
                    .id(UUID.randomUUID())
                    .etterlevelseDokumentId(pvkDokument.getEtterlevelseDokumentId())
                    .status(no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus.UNDERARBEID)
                    .pvkDokumentData(freshData)
                    .build();

            newPvk = pvkDokumentRepo.save(newPvk);

            // Enqueue archiving to P360 if case number exists
            enqueueP360ArchivingIfPossible(pvkDokument);
            return Optional.ofNullable(newPvk);
        }

        return Optional.empty();
    }

    private void enqueueP360ArchivingIfPossible(PvkDokument pvkDokument) {
        try {
            EtterlevelseDokumentasjon eDok = etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId());
            if (eDok == null) {
                log.warn("Cannot enqueue archiving: missing etterlevelse dokumentasjon for pvk {}", pvkDokument.getId());
                return;
            }
            var caseNumber = eDok.getEtterlevelseDokumentasjonData().getP360CaseNumber();
            if (caseNumber == null || caseNumber.isEmpty()) {
                log.warn("Skipping P360 enqueue: no case number set for E{} {}", eDok.getEtterlevelseNummer(), eDok.getTitle());
                return;
            }

            java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyy'-'MM'-'dd");
            java.text.SimpleDateFormat titleDateformatter = new java.text.SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");
            java.util.Date date = new java.util.Date();

            String filename = titleDateformatter.format(date) + "_Etterlevelse_E" + eDok.getEtterlevelseNummer();
            String documentTitle = "Personvernkonsekvensvurdering for E" + eDok.getEtterlevelseNummer() + " " + eDok.getTitle().replace(":", " -").trim();

            // Generate main document
            byte[] wordFile = etterlevelseDokumentasjonToDoc.generateDocFor(eDok.getId(), java.util.Collections.emptyList(), java.util.Collections.emptyList(), false, true);

            // Fetch behandlingens livsløp files
            BehandlingensLivslop behandlingenslivslop = behandlingensLivslopService.getByEtterlevelseDokumentasjon(eDok.getId()).orElse(new BehandlingensLivslop());
            java.util.List<BehandlingensLivslopFil> BLLFiler = behandlingenslivslop.getBehandlingensLivslopData().getFiler();

            // Build request
            java.util.List<P360File> filer = new java.util.ArrayList<>();
            filer.add(P360File.builder()
                    .Title(filename)
                    .Format("docx")
                    .Base64Data(java.util.Base64.getEncoder().encodeToString(wordFile))
                    .build());

            if (BLLFiler != null) {
                for (var behandlingensLivslopFil : BLLFiler) {
                    String[] bllFileName = behandlingensLivslopFil.getFilnavn().split("\\.");
                    filer.add(P360File.builder()
                            .Title(bllFileName[0])
                            .Format(bllFileName.length > 1 ? bllFileName[1] : "dat")
                            .Base64Data(java.util.Base64.getEncoder().encodeToString(behandlingensLivslopFil.getFil()))
                            .build());
                }
            }

            P360DocumentCreateRequest p360DocumentCreateRequest = P360DocumentCreateRequest.builder()
                    .CaseNumber(caseNumber)
                    .Archive("Saksdokument")
                    .DefaultValueSet("Etterlevelse")
                    .Title(documentTitle)
                    .DocumentDate(formatter.format(date))
                    .Status("J")
                    .AccessGroup("Alle ansatte i Nav")
                    .ResponsiblePersonIdNumber(SecurityUtils.getCurrentIdent())
                    .Files(filer)
                    .build();

            p360Service.save(p360DocumentCreateRequest);
            log.info("Enqueued PVK archiving to P360 for E{} {}", eDok.getEtterlevelseNummer(), eDok.getTitle());
        } catch (Exception e) {
            log.error("Failed to enqueue PVK archiving: {}", e.getMessage());
        }
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public boolean isDeleteable(UUID id) {
        PvkDokument pvkDokument = pvkDokumentRepo.findById(id).orElse(null);
        return pvkDokument != null
                && risikoscenarioService.getByPvkDokument(id.toString(), RisikoscenarioType.ALL).isEmpty()
                && tiltakService.getByPvkDokument(id).isEmpty();
    }
    
    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument delete(UUID id) {
        if (!isDeleteable(id)) {
            return null;
        }
        PvkDokument pvkDokumentToDelete = pvkDokumentRepo.findById(id).orElse(null);
        pvkDokumentRepo.deleteById(id);
        return pvkDokumentToDelete;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument deletePvkAndAllChildren(UUID id) {

        log.info("deleting tiltak connected to pvk dokument with id={}", id);
        tiltakService.deleteByPvkDokumentId(id);

        log.info("deleting risikoscenario connected to pvk dokument with id={}", id);
        risikoscenarioService.deleteByPvkDokumentId(id);

        log.info("deleting pvo tilbakemelding connected to pvk dokument with id={}", id);
        pvoTilbakemeldingService.deleteByPvkDokumentId(id);

        return delete(id);
    }

}
