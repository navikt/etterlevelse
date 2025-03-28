package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ForbiddenException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivService;
import no.nav.data.etterlevelse.documentRelation.DocumentRelationService;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepoCustom;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonWithRelationRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.EtterlevelseMetadataService;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.ResourceType;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonService {
    
    // TODO: Flere avhengighet i denne serviceklassen til controller

    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    private final EtterlevelseDokumentasjonRepoCustom etterlevelseDokumentasjonRepoCustom;
    
    private final BehandlingService behandlingService;
    private final EtterlevelseMetadataService etterlevelseMetadataService;
    private final EtterlevelseService etterlevelseService;
    private final EtterlevelseArkivService etterlevelseArkivService;
    private final TeamcatTeamClient teamcatTeamClient;
    private final TeamcatResourceClient teamcatResourceClient;
    private final DocumentRelationService documentRelationService;

    public EtterlevelseDokumentasjon get(UUID uuid) {
        if (uuid == null) {
            return null; 
        }
        return etterlevelseDokumentasjonRepo.findById(uuid).orElse(null);
    }
    
    public boolean exists(UUID uuid) {
        return etterlevelseDokumentasjonRepo.existsById(uuid);
    }

    public Page<EtterlevelseDokumentasjon> getAll(PageParameters pageParameters) {
        return etterlevelseDokumentasjonRepo.findAll(pageParameters.createPage());
    }

    public List<EtterlevelseDokumentasjon> getEtterlevelseDokumentasjonerByTeam(String teamId) {
        return etterlevelseDokumentasjonRepoCustom.getEtterlevelseDokumentasjonerForTeam(List.of(teamId));
    }

    public List<EtterlevelseDokumentasjon> searchEtterlevelseDokumentasjon(String searchParam) {
        if (searchParam.toLowerCase().matches("e[0-9]+(.*)")) {
            return etterlevelseDokumentasjonRepo.searchEtterlevelseDokumentasjon(searchParam.substring(1));
        } else {
            return etterlevelseDokumentasjonRepo.searchEtterlevelseDokumentasjon(searchParam);
        }
    }

    public List<EtterlevelseDokumentasjon> getByFilter(EtterlevelseDokumentasjonFilter filter) {
        if (!StringUtils.isBlank(filter.getId())) {
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.getReferenceById(UUID.fromString(filter.getId()));
            if (etterlevelseDokumentasjon != null) {
                return List.of(etterlevelseDokumentasjon);
            }
            return List.of();
        } else if (filter.isGetMineEtterlevelseDokumentasjoner()) {
            filter.setTeams(convert(teamcatTeamClient.getMyTeams(), Team::getId));
        }

        if ((filter.getTeams() != null && !filter.getTeams().isEmpty()) || filter.isGetMineEtterlevelseDokumentasjoner()) {
            return filter.getTeams().parallelStream().map(this::getEtterlevelseDokumentasjonerByTeam).flatMap(Collection::stream).toList();
        }

        if (filter.isSok()) {
            return searchEtterlevelseDokumentasjon(filter.getSok());
        }
        if (filter.getBehandlingId() != null && !filter.getBehandlingId().isEmpty()) {
            return getByBehandlingId(List.of(filter.getBehandlingId()));
        }
        if (filter.getVirkemiddelId() != null && !filter.getVirkemiddelId().isEmpty()) {
            return getByVirkemiddelId(List.of(filter.getVirkemiddelId()));
        }
        return etterlevelseDokumentasjonRepoCustom.findBy(filter);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon save(EtterlevelseDokumentasjonRequest request) {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = request.isUpdate() ? etterlevelseDokumentasjonRepo.getReferenceById(request.getIdAsUUID()) : new EtterlevelseDokumentasjon();
        request.mergeInto(etterlevelseDokumentasjon);

        if (!request.isUpdate()) {
            etterlevelseDokumentasjon.setEtterlevelseNummer(etterlevelseDokumentasjonRepo.nextEtterlevelseDokumentasjonNummer());
        }

        if (request.isUpdate() && !etterlevelseDokumentasjon.isForGjenbruk()) {
            var documentRelations = documentRelationService.findByFromDocumentAndRelationType(request.getId(), RelationType.ARVER);
            if (!documentRelations.isEmpty()) {
                throw new ValidationException("Kan ikke fjerne gjenbruk fordi etterlevelses dokument er arvet av " + documentRelations.size() + " etterlevelsesdokumentasjon.");
            }
        }

        return etterlevelseDokumentasjonRepo.save(etterlevelseDokumentasjon);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon updateKravPriority(EtterlevelseDokumentasjonRequest request) {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.getReferenceById(request.getIdAsUUID());
        etterlevelseDokumentasjon.setPrioritertKravNummer(request.getPrioritertKravNummer());
        return etterlevelseDokumentasjonRepo.save(etterlevelseDokumentasjon);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon saveAndCreateRelationWithEtterlevelseCopy(UUID fromDocumentID, EtterlevelseDokumentasjonWithRelationRequest request) {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = new EtterlevelseDokumentasjon();
        request.mergeInto(etterlevelseDokumentasjon);
        etterlevelseDokumentasjon.setEtterlevelseNummer(etterlevelseDokumentasjonRepo.nextEtterlevelseDokumentasjonNummer());
        log.info("creating new Etterlevelse document with relation");
        var newEtterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.save(etterlevelseDokumentasjon);

        etterlevelseService.copyEtterlevelse(fromDocumentID, newEtterlevelseDokumentasjon.getId());

        var newDocumentRelation = documentRelationService.save(
                DocumentRelation.builder()
                        .fromDocument(fromDocumentID.toString())
                        .toDocument(newEtterlevelseDokumentasjon.getId().toString())
                        .relationType(request.getRelationType())
                        .build(), false);

        log.info("Created new relation with fromId = {}, toId = {} with relation type = {}", newDocumentRelation.getFromDocument(), newDocumentRelation.getToDocument(), newDocumentRelation.getRelationType().name());

        return newEtterlevelseDokumentasjon;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon deleteEtterlevelseDokumentasjonAndAllChildren(UUID id) {

        if (!documentRelationService.findByFromDocument(id.toString()).isEmpty() || !documentRelationService.findByToDocument(id.toString()).isEmpty()) {
            log.info("Requested to delete etterlevelses dokumentasjon id={} with relation.", id);
            throw new ForbiddenException("Kan ikke slette et dokument som har relasjoner.");
        }

        log.info("deleting etterlevelse metadata connected to etterlevelse dokumentasjon with id={}", id);
        etterlevelseMetadataService.deleteByEtterlevelseDokumentasjonId(id.toString());

        log.info("deleting etterlevelse arkiv connected to etterlevelse dokumentasjon with id={}", id);
        etterlevelseArkivService.deleteByEtterlevelseDokumentsjonId(id.toString());

        log.info("deleting etterlevelse connected to etterlevelse dokumentasjon with id={}", id);
        etterlevelseService.deleteByEtterlevelseDokumentasjonId(id);

        return delete(id);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon delete(UUID id) {
        var eDokToDelete = etterlevelseDokumentasjonRepo.findById(id);
        etterlevelseDokumentasjonRepo.deleteById(id);
        return eDokToDelete.orElse(null);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon updatePriorityList(UUID etterlevelseDokumentasjonId, int kravNummer, boolean prioritized) {

        EtterlevelseDokumentasjon etterlevelseDokumentasjon = get(etterlevelseDokumentasjonId);

        List<String> priorityList = etterlevelseDokumentasjon.getPrioritertKravNummer() == null ? new ArrayList<>() : etterlevelseDokumentasjon.getPrioritertKravNummer();

        if (prioritized) {
            if (!priorityList.contains(String.valueOf(kravNummer))) {
                priorityList.add(String.valueOf(kravNummer));
            }
        } else {
            if (priorityList.contains(String.valueOf(kravNummer))) {
                priorityList = priorityList.stream().filter(number -> !number.equals(String.valueOf(kravNummer))).toList();
            }
        }
        etterlevelseDokumentasjon.setPrioritertKravNummer(priorityList);
        return etterlevelseDokumentasjonRepo.save(etterlevelseDokumentasjon);
    }


    public List<EtterlevelseDokumentasjon> getByBehandlingId(List<String> ids) {
        return etterlevelseDokumentasjonRepoCustom.findByBehandlingIds(ids);
    }

    public List<EtterlevelseDokumentasjon> getByVirkemiddelId(List<String> ids) {
        return etterlevelseDokumentasjonRepo.findByVirkemiddelIds(ids);
    }

    public Page<EtterlevelseDokumentasjon> getAllWithValidBehandling(Pageable page) {
        return etterlevelseDokumentasjonRepo.getAllEtterlevelseDokumentasjonWithValidBehandling(page);
    }

    public Page<EtterlevelseDokumentasjon> getAll(Pageable pageable) {
        return etterlevelseDokumentasjonRepo.findAll(pageable);
    }

    public List<EtterlevelseDokumentasjon> findByKravRelevans(List<String> kravRelevans) {
        return etterlevelseDokumentasjonRepoCustom.findByKravRelevans(kravRelevans);
    }

    // Does not update DB
    // TODO: Skal ikke være avhengighet til dto i service
    public void addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        etterlevelseDokumentasjonResponse.setBehandlinger(getBehandlingData(etterlevelseDokumentasjonResponse.getBehandlingIds()));
        etterlevelseDokumentasjonResponse.setTeamsData(getTeamsData(etterlevelseDokumentasjonResponse.getTeams()));
        etterlevelseDokumentasjonResponse.setResourcesData(getResourcesData(etterlevelseDokumentasjonResponse.getResources()));
        etterlevelseDokumentasjonResponse.setRisikoeiereData(getRisikoeiereData(etterlevelseDokumentasjonResponse.getRisikoeiere()));
    }

    private List<Behandling> getBehandlingData(List<String> behandlinger) {
        if (behandlinger == null || behandlinger.isEmpty()) {
            return null;
        }

        List<Behandling> behandlingList = new ArrayList<>();
        behandlinger.forEach((behandlingId) -> {
            try {
                var behandling = behandlingService.getBehandling(behandlingId);
                behandlingList.add(behandling);
            } catch (WebClientResponseException.NotFound e) {
                var behandling = new Behandling();
                behandling.setId(behandlingId);
                behandling.setNavn("Fant ikke behandling med id: " + behandlingId);
                behandlingList.add(behandling);
            }
        });
        return behandlingList;
    }

    private List<TeamResponse> getTeamsData(List<String> teams) {
        if (teams == null || teams.isEmpty()) {
            return null;
        }

        List<TeamResponse> teamsData = new ArrayList<>();
        teams.forEach((teamId) -> {
            var teamData = teamcatTeamClient.getTeam(teamId);
            if (teamData.isPresent()) {
                teamsData.add(teamData.get().toResponseWithMembers());
            } else {
                var emptyTeamData = new TeamResponse();
                emptyTeamData.setId(teamId);
                emptyTeamData.setName("Fant ikke team med id: " + teamId);
                emptyTeamData.setDescription("Fant ikke team med id: " + teamId);
                teamsData.add(emptyTeamData);
            }
        });
        return teamsData;
    }

    private List<Resource> getResourcesData(List<String> resourceIds) {
        if (resourceIds == null || resourceIds.isEmpty()) {
            return null;
        }

        List<Resource> resourcessData = new ArrayList<>();
        resourceIds.forEach((ident) -> {
            var resourceData = teamcatResourceClient.getResource(ident);
            if (resourceData.isPresent()) {
                resourcessData.add(resourceData.get());
            } else {
                var emptyResourceData = new Resource();
                emptyResourceData.setNavIdent(ident);
                emptyResourceData.setGivenName("Fant ikke person med NAV ident: " + ident);
                emptyResourceData.setFamilyName("Fant ikke person med NAV ident: " + ident);
                emptyResourceData.setFullName("Fant ikke person med NAV ident: " + ident);
                emptyResourceData.setEmail("Fant ikke person med NAV ident: " + ident);
                emptyResourceData.setResourceType(ResourceType.INTERNAL);
                resourcessData.add(emptyResourceData);
            }
        });
        return resourcessData;
    }

    private List<Resource> getRisikoeiereData(List<String> risikoeiere) {
        if (risikoeiere == null || risikoeiere.isEmpty()) {
            return null;
        }

        List<Resource> risikoeiereData = new ArrayList<>();
        risikoeiere.forEach((ident) -> {
            var risikoeiereMetaData = teamcatResourceClient.getResource(ident);
            if (risikoeiereMetaData.isPresent()) {
                risikoeiereData.add(risikoeiereMetaData.get());
            } else {
                var emptyResourceData = new Resource();
                emptyResourceData.setNavIdent(ident);
                emptyResourceData.setGivenName("Fant ikke person med NAV ident: " + ident);
                emptyResourceData.setFamilyName("Fant ikke person med NAV ident: " + ident);
                emptyResourceData.setFullName("Fant ikke person med NAV ident: " + ident);
                emptyResourceData.setEmail("Fant ikke person med NAV ident: " + ident);
                emptyResourceData.setResourceType(ResourceType.INTERNAL);
                risikoeiereData.add(emptyResourceData);
            }
        });
        return risikoeiereData;
    }

}
