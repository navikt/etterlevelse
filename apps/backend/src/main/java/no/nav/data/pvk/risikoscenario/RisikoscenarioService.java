package no.nav.data.pvk.risikoscenario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioRepo;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioRepoCustom;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.tiltak.domain.TiltakRepo;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RisikoscenarioService {

    private final RisikoscenarioRepo risikoscenarioRepo;
    private final TiltakRepo tiltakRepo;
    private final RisikoscenarioRepoCustom risikoscenarioRepoCustom;

    public Risikoscenario get(UUID uuid) {
        return risikoscenarioRepo.findById(uuid).orElse(null);
    }

    public Page<Risikoscenario> getAll(PageParameters pageParameters) {
        return risikoscenarioRepo.findAll(pageParameters.createPage());
    }

    public List<Risikoscenario> getByPvkDokument(String pvkDokumentId, RisikoscenarioType scenarioType) {
        List<Risikoscenario> risikoscenarioList = risikoscenarioRepo.findByPvkDokumentId(UUID.fromString(pvkDokumentId));
        risikoscenarioList.sort(Comparator.comparing(Risikoscenario::getCreatedDate));
        switch (scenarioType) {
            case GENERAL -> {
                return risikoscenarioList.stream().filter((scenario) -> scenario.getRisikoscenarioData().isGenerelScenario()).collect(Collectors.toList());
            }
            case KRAV -> {
                return risikoscenarioList.stream().filter((scenario) -> !scenario.getRisikoscenarioData().isGenerelScenario()).collect(Collectors.toList());
            }
            default -> {
                return risikoscenarioList;
            }
        }
    }

    public List<Risikoscenario> getByKravNummer(Integer kravNummer) {
        return risikoscenarioRepoCustom.findByKravNummer(kravNummer);
    }

    @Transactional
    public List<Risikoscenario> addRelevantKravToRisikoscenarioer(Integer kravnummer, List<String> risikoscenarioIder) {
        List<Risikoscenario> res = new ArrayList<Risikoscenario>();
        for (String id : risikoscenarioIder) {
            Risikoscenario risikoscenario = get(UUID.fromString(id));
            // Yes, risikoscenario may be null here. Not considered a problem that this will cause NPE → Internal Server Error.
            risikoscenario.getRisikoscenarioData().setGenerelScenario(false);
            List<Integer> kravList = risikoscenario.getRisikoscenarioData().getRelevanteKravNummer();
            if (!kravList.contains(kravnummer)) {
                kravList.add(kravnummer);
            }
            res.add(risikoscenarioRepo.save(risikoscenario));
        }
        return res;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Risikoscenario save(Risikoscenario risikoscenario, boolean isUpdate) {
        if (!isUpdate) {
            risikoscenario.setId(UUID.randomUUID());
        }
        return risikoscenarioRepo.save(risikoscenario);
    }

    /**
     * @throws DataIntegrityViolationException If the Risikoscenario is related to one or more Tiltak
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public Risikoscenario delete(UUID id) {
        var pvkDokumentToDelete = risikoscenarioRepo.findById(id);
        risikoscenarioRepo.deleteById(id);
        return pvkDokumentToDelete.orElse(null);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Risikoscenario addTiltak(UUID risikoscenarioId, List<UUID> tiltakIds) {
        for (UUID tiltakId : tiltakIds) {
            tiltakRepo.insertTiltakRisikoscenarioRelation(risikoscenarioId, tiltakId);
        }

        Risikoscenario risikoscenario = get(risikoscenarioId);
        risikoscenario.getRisikoscenarioData().setTiltakOppdatert(true);
        return risikoscenarioRepo.save(risikoscenario);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Risikoscenario updateTiltakOppdatertField(UUID risikoscenarioId, boolean tiltakOppdatert) {
        Risikoscenario risikoscenario = get(risikoscenarioId);
        risikoscenario.getRisikoscenarioData().setTiltakOppdatert(tiltakOppdatert);
        return risikoscenarioRepo.save(risikoscenario);
    }

    /**
     * Returns false if nothing was removed
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean removeTiltak(UUID id, UUID tiltakId) {
        int removed = tiltakRepo.deleteTiltakRisikoscenarioRelation(id, tiltakId);
        return removed > 0;
    }
    
    public List<UUID> getTiltak(UUID uuid) {
        return tiltakRepo.getTiltakForRisikoscenario(uuid);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteByPvkDokumentId(UUID pvkDokumentId) {
        List<Risikoscenario> risikoscenarioList = risikoscenarioRepo.findByPvkDokumentId(pvkDokumentId);
        risikoscenarioList.forEach(r -> log.info("deleting risikoscenario with id={}, connected to pvk dokument with id={}", r.getId(), pvkDokumentId));
        risikoscenarioRepo.deleteAll(risikoscenarioList);
    }

}
