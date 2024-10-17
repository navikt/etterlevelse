package no.nav.data.pvk.pvkdokument;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
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

    private PvkDokumentRepo repo;

    public PvkDokument get(UUID uuid) {
        if (uuid == null || !repo.existsById(uuid)) return null;
        return getPvkDokument(uuid);
    }

    private PvkDokument getPvkDokument(UUID uuid) {
        return repo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find Pvk Dokument with id " + uuid));
    }

    @Transactional
    public PvkDokument saveTestData(PvkDokument pvkDokument) {
        pvkDokument = repo.save(pvkDokument);
        repo.flush();
        return pvkDokument;
    }

    public Page<PvkDokument> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage());
    }

    public Optional<PvkDokument> getByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
        return repo.findByEtterlevelseDokumensjon(etterlevelseDokumentasjonId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument save(PvkDokument pvkDokument, boolean isUpdate) {

        if (!isUpdate) {
            var existingPvkDokument = repo.findByEtterlevelseDokumensjon(pvkDokument.getEtterlevelseDokumentId());
            if (existingPvkDokument.isPresent()) {
                log.warn("Found existing pvk document when trying to create for etterlevelse dokumentation id: {}", pvkDokument.getEtterlevelseDokumentId());
                pvkDokument.setId(existingPvkDokument.get().getId());
            } else {
                pvkDokument.setId(UUID.randomUUID());
            }
        }

        return repo.save(pvkDokument);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument delete(UUID id) {
        var pvkDokumentToDelete = repo.findById(id);
        repo.deleteById(id);
        return pvkDokumentToDelete.orElse(null);
    }
}
