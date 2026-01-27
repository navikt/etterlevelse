package no.nav.data.pvk.pvotilbakemelding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingRepo;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingRepoCustom;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemeldingFilter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PvoTilbakemeldingService {
    private final PvoTilbakemeldingRepo pvoTilbakemeldingRepo;
    private final PvoTilbakemeldingRepoCustom pvoTilbakemeldingRepoCustom;

    public PvoTilbakemelding get(UUID uuid) {
        if (uuid == null || !pvoTilbakemeldingRepo.existsById(uuid)) return null;
        return getPvoTilbakemelding(uuid);
    }

    public PvoTilbakemelding getPvoTilbakemelding(UUID uuid) {
        return pvoTilbakemeldingRepo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find Pvo tilbakemelding with id " + uuid));
    }

    public Page<PvoTilbakemelding> getAll(PageParameters pageParameters) {
        return pvoTilbakemeldingRepo.findAll(pageParameters.createPage());
    }

    public Page<PvoTilbakemelding> getAll(Pageable pageable) {
        return pvoTilbakemeldingRepo.findAll(pageable);
    }

    public Optional<PvoTilbakemelding> getByPvkDokumentId(UUID pvkDokumentId) {
        return pvoTilbakemeldingRepo.findByPvkDokumentId(pvkDokumentId);
    }

    public List<PvoTilbakemelding> getByFilter(PvoTilbakemeldingFilter filter) {
        if (!StringUtils.isBlank(filter.getId())) {
            PvoTilbakemelding pvoTilbakemelding = pvoTilbakemeldingRepo.getReferenceById(UUID.fromString(filter.getId()));
            if (pvoTilbakemelding != null) {
                return List.of(pvoTilbakemelding);
            }
            return List.of();
        }

        return pvoTilbakemeldingRepoCustom.findBy(filter);
    }


    @Transactional(propagation = Propagation.REQUIRED)
    public PvoTilbakemelding save(PvoTilbakemelding pvoTilbakemelding, boolean isUpdate) {
        if (!isUpdate) {
            var existingPvoTilbakemelding = getByPvkDokumentId(pvoTilbakemelding.getPvkDokumentId());
            if (existingPvoTilbakemelding.isPresent()) {
                log.warn("Found existing pvo tilbakemelding when trying to create for pvk dokument id: {}", pvoTilbakemelding.getPvkDokumentId());
                pvoTilbakemelding.setId(existingPvoTilbakemelding.get().getId());
            } else {
                pvoTilbakemelding.setId(UUID.randomUUID());
            }
        }

        return pvoTilbakemeldingRepo.save(pvoTilbakemelding);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public PvoTilbakemelding delete(UUID id) {
        var pvoTilbakemeldingToDelete = pvoTilbakemeldingRepo.findById(id);
        pvoTilbakemeldingRepo.deleteById(id);
        return pvoTilbakemeldingToDelete.orElse(null);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteByPvkDokumentId(UUID pvkDokumentId) {
        PvoTilbakemelding pvoTilbakemelding = pvoTilbakemeldingRepo.findByPvkDokumentId(pvkDokumentId).orElse(null);
        if (pvoTilbakemelding != null) {
            log.info("deleting risikoscenario with id={}, connected to pvk dokument with id={}", pvoTilbakemelding.getId(), pvkDokumentId);
            pvoTilbakemeldingRepo.delete(pvoTilbakemelding);
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void etterlevelseDocumentVersionUpdate(UUID pvkDokumentId) {
        Optional<PvoTilbakemelding> pvoTilbakemeldingOpt = getByPvkDokumentId(pvkDokumentId);
        if (pvoTilbakemeldingOpt.isPresent()) {
            PvoTilbakemelding pvoTilbakemelding = pvoTilbakemeldingOpt.get();
            pvoTilbakemelding.setStatus(PvoTilbakemeldingStatus.IKKE_PABEGYNT);
            save(pvoTilbakemelding, true);
        }
    }
}

