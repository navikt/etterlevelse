package no.nav.data.pvk.pvotilbakemelding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingRepo;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PvoTilbakemeldingService {
    private final PvoTilbakemeldingRepo pvoTilbakemeldingRepo;

    public PvoTilbakemelding get(UUID uuid) {
        if(uuid == null || !pvoTilbakemeldingRepo.existsById(uuid)) return null;
        return getPvoTilbakemelding(uuid);
    }

    public PvoTilbakemelding getPvoTilbakemelding(UUID uuid) {
        return pvoTilbakemeldingRepo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find Pvk Dokument with id " + uuid));
    }

    public Page<PvoTilbakemelding> getAll(PageParameters pageParameters) {
        return pvoTilbakemeldingRepo.findAll(pageParameters.createPage());
    }

    public Optional<PvoTilbakemelding> getByPvkDokumentId(String pvkDokumentId) {
        return pvoTilbakemeldingRepo.findByPvkDokumentId(pvkDokumentId);
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
}

