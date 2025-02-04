package no.nav.data.pvk.tiltak;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakRepo;
import org.springframework.dao.DataIntegrityViolationException;
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
public class TiltakService {

    private final TiltakRepo repo;
    
    public Page<Tiltak> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage());
    }

    public Tiltak get(UUID uuid) {
        return repo.findById(uuid).orElse(null);
    }

    /**
     * @throws DataIntegrityViolationException If the Risikoscenario does not exist
     */
    @Transactional
    public Tiltak save(Tiltak tiltak, UUID risikoscenarioId, boolean update) {
        if (!update) {
            tiltak.setId(UUID.randomUUID());
        }
        tiltak = repo.save(tiltak);
        if (risikoscenarioId != null) {
            addRisikoscenarioTiltakRelasjon(risikoscenarioId.toString(), tiltak.getId().toString());
        }
        return tiltak;
    }

    @Transactional
    public Tiltak delete(UUID id) {
        Optional<Tiltak> tiltak = repo.findById(id);
        try {
            repo.deleteById(id);
        } catch (DataIntegrityViolationException e) { // FIXME: Flytt ut til controller
            log.warn("Could not delete tiltak with id: Tiltak is related to one or more Risikoscenario", id);
            throw new ValidationException("Could not delete tiltak: Tiltak is related to one or more Risikoscenario");
        }
        return tiltak.orElse(null);
    }

    /**
     * @throws DataIntegrityViolationException If the Risikoscenario or Tiltak does not exist
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void addRisikoscenarioTiltakRelasjon(String risikoscenarioId, String tiltakId) {
        repo.insertTiltakRisikoscenarioRelation(risikoscenarioId, tiltakId);
    }

    public List<Tiltak> getByPvkDokument(String pvkDokumentId) {
        return repo.findByPvkDokumentId(pvkDokumentId);
    }

    public List<String> getRisikoscenarioer(String id) {
        return repo.getRisikoscenarioForTiltak(id);
    }

}
