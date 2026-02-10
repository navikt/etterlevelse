package no.nav.data.pvk.pvkdokument;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.risikoscenario.RisikoscenarioService;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.tiltak.TiltakService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PvkDokumentService {

    private final PvkDokumentRepo pvkDokumentRepo;
    private final RisikoscenarioService risikoscenarioService;
    private final TiltakService tiltakService;
    private final PvoTilbakemeldingService pvoTilbakemeldingService;

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
