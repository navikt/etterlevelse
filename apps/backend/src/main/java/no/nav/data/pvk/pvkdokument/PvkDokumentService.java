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

    private final PvkDokumentRepo pvkDokumentRepo;

    public PvkDokument get(UUID uuid) {
        if (uuid == null || !pvkDokumentRepo.existsById(uuid)) return null;
        return getPvkDokument(uuid);
    }

    private PvkDokument getPvkDokument(UUID uuid) {
        return pvkDokumentRepo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find Pvk Dokument with id " + uuid));
    }

    public Page<PvkDokument> getAll(PageParameters pageParameters) {
        return pvkDokumentRepo.findAll(pageParameters.createPage());
    }

    public Optional<PvkDokument> getByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
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

    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument delete(UUID id) {
        // FIXME: Det skal ikke gå an å slette et PvkDokument hvis noe refererer til det (risikoscenario, tiltak, fil, mm.)
        var pvkDokumentToDelete = pvkDokumentRepo.findById(id);
        pvkDokumentRepo.deleteById(id);
        return pvkDokumentToDelete.orElse(null);
    }

}
