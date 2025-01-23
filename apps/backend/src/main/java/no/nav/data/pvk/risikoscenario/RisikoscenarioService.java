package no.nav.data.pvk.risikoscenario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioRepo;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioRepoCustom;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioRequest;
import no.nav.data.pvk.tiltak.domain.TiltakRepo;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
        if (uuid == null || !risikoscenarioRepo.existsById(uuid)) return null;
        return getRisikoscenario(uuid);
    }

    private Risikoscenario getRisikoscenario(UUID uuid) {
        return risikoscenarioRepo.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find Pvk Dokument with id " + uuid));
    }

    public Page<Risikoscenario> getAll(PageParameters pageParameters) {
        return risikoscenarioRepo.findAll(pageParameters.createPage());
    }

    public List<Risikoscenario> getByPvkDokument(String pvkDokumentId, RisikoscenarioType scenarioType) {
        List<Risikoscenario> risikoscenarioList = risikoscenarioRepo.findByPvkDokumentId(pvkDokumentId);
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

    public List<Risikoscenario> getByKravNummer(String kravNummer) {
        return risikoscenarioRepoCustom.findByKravNummer(kravNummer);
    }

    public RisikoscenarioRequest updateRelevantKravListe(RisikoscenarioRequest request) {
        // FIXME: Avhengighet til Request i Service
        var risikoscenario = get(request.getIdAsUUID());

        //remove krav from list based on request krav to remove
        List<Integer> newKravList = new ArrayList<>(CollectionUtils.removeAll(
                risikoscenario.getRisikoscenarioData().getRelevanteKravNummer(),
                request.getKravToDelete()).stream().toList());

        //add new krav to list based on request krav to remove
        newKravList.addAll(request.getKravToAdd());

        //remove duplicates
        List<Integer> uniqueKravList = newKravList.stream().distinct().collect(Collectors.toList());

        request.setRelevanteKravNummer(uniqueKravList);
        return request;
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

    @Transactional(propagation = Propagation.REQUIRED)
    public Risikoscenario addTiltak(String riskoscenarioId, List<String> tiltakIds) {
        for (String tiltakId : tiltakIds) {
            tiltakRepo.insertTiltakRisikoscenarioRelation(riskoscenarioId, tiltakId);
        }
        return getRisikoscenario(UUID.fromString(riskoscenarioId));
    }

    /**
     * Returns false if nothing was removed
     */
    public boolean removeTiltak(String id, String tiltakId) {
        int removed = tiltakRepo.deleteTiltakRisikoscenarioRelation(id, tiltakId);
        return removed > 0;
    }
    
    public List<String> getTiltak(String uuid) {
        return tiltakRepo.getTiltakForRisikoscenario(uuid);
    }
}
