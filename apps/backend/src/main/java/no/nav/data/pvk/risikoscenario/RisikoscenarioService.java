package no.nav.data.pvk.risikoscenario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.risikoscenario.domain.Riskoscenario;
import no.nav.data.pvk.risikoscenario.domain.RiskoscenarioRepo;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RisikoscenarioService {

    private final RiskoscenarioRepo riskoscenarioRepo;

    public Riskoscenario get(UUID uuid) {
        if (uuid == null || !riskoscenarioRepo.existsById(uuid)) return null;
        return getRiskoscenario(uuid);
    }

    private Riskoscenario getRiskoscenario(UUID uuid) {
        return riskoscenarioRepo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find Pvk Dokument with id " + uuid));
    }

    public Page<Riskoscenario> getAll(PageParameters pageParameters) {
        return riskoscenarioRepo.findAll(pageParameters.createPage());
    }

    public List<Riskoscenario> getByPvkDokument(String pvkDokumentId) {
        return riskoscenarioRepo.findByPvkDokumentId(pvkDokumentId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Riskoscenario save(Riskoscenario riskoscenario, boolean isUpdate) {
        if (!isUpdate) {
            riskoscenario.setId(UUID.randomUUID());
        }

        return riskoscenarioRepo.save(riskoscenario);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Riskoscenario delete(UUID id) {
        var pvkDokumentToDelete = riskoscenarioRepo.findById(id);
        riskoscenarioRepo.deleteById(id);
        return pvkDokumentToDelete.orElse(null);
    }
}
