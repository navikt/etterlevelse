package no.nav.data.etterlevelse.behandlingensLivslop;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopRepo;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class BehandlingensLivslopService {

    private final BehandlingensLivslopRepo repo;

    public BehandlingensLivslop get(UUID uuid) {
        if (uuid == null || !repo.existsById(uuid)) return null;
        return getBehandlingensLivslop(uuid);
    }

    private BehandlingensLivslop getBehandlingensLivslop(UUID uuid) {
        return repo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find behandlingens livsløp with id " + uuid));
    }

    @Transactional
    public BehandlingensLivslop saveTestData(BehandlingensLivslop behandlingensLivslop) {
        behandlingensLivslop = repo.save(behandlingensLivslop);
        repo.flush();
        return behandlingensLivslop;
    }

    public Page<BehandlingensLivslop> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage());
    }

    public Optional<BehandlingensLivslop> getByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
        return repo.findByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public BehandlingensLivslop save(BehandlingensLivslop behandlingensLivslop, boolean isUpdate) {
        if (!isUpdate) {
            var existingBehandlingensLivslop = getByEtterlevelseDokumentasjon(behandlingensLivslop.getEtterlevelseDokumentasjonId());
            if (existingBehandlingensLivslop.isPresent()) {
                log.warn("Found existing behandlingens livsløp when trying to create for etterlevelse dokumentation id: {}", behandlingensLivslop.getEtterlevelseDokumentasjonId());
                behandlingensLivslop.setId(existingBehandlingensLivslop.get().getId());
            } else {
                behandlingensLivslop.setId(UUID.randomUUID());
            }
        }

        return repo.save(behandlingensLivslop);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public BehandlingensLivslop delete(UUID id) {
        var behandlingensLivslopToDelete = repo.findById(id);
        repo.deleteById(id);
        return behandlingensLivslopToDelete.orElse(null);
    }

}