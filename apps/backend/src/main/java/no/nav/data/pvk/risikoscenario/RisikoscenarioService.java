package no.nav.data.pvk.risikoscenario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioRepo;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RisikoscenarioService {

    private final RisikoscenarioRepo risikoscenarioRepo;

    public Risikoscenario get(UUID uuid) {
        if (uuid == null || !risikoscenarioRepo.existsById(uuid)) return null;
        return getRiskoscenario(uuid);
    }

    private Risikoscenario getRiskoscenario(UUID uuid) {
        return risikoscenarioRepo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find Pvk Dokument with id " + uuid));
    }

    public Page<Risikoscenario> getAll(PageParameters pageParameters) {
        return risikoscenarioRepo.findAll(pageParameters.createPage());
    }

    public List<Risikoscenario> getByPvkDokument(String pvkDokumentId) {
        return risikoscenarioRepo.findByPvkDokumentId(pvkDokumentId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Risikoscenario save(Risikoscenario risikoscenario, boolean isUpdate) {
        if (!isUpdate) {
            risikoscenario.setId(UUID.randomUUID());
        }

        return risikoscenarioRepo.save(risikoscenario);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Risikoscenario delete(UUID id) {
        var pvkDokumentToDelete = risikoscenarioRepo.findById(id);
        risikoscenarioRepo.deleteById(id);
        return pvkDokumentToDelete.orElse(null);
    }
}
