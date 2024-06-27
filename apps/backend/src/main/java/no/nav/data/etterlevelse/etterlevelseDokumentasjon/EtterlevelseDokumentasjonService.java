package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivService;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.documentRelation.DocumentRelationService;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationRequest;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonWithRelationRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.EtterlevelseMetadataService;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.MemberResponse;
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

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;
import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonService extends DomainService<EtterlevelseDokumentasjon> {

    private final BehandlingService behandlingService;
    private final EtterlevelseMetadataService etterlevelseMetadataService;
    private final EtterlevelseService etterlevelseService;
    private final EtterlevelseArkivService etterlevelseArkivService;
    private final TeamcatTeamClient teamcatTeamClient;
    private final TeamcatResourceClient teamcatResourceClient;
    private final DocumentRelationService documentRelationService;

    public Page<EtterlevelseDokumentasjon> getAll(PageParameters pageParameters) {
        return etterlevelseDokumentasjonRepo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public List<EtterlevelseDokumentasjon> getEtterlevelseDokumentasjonerByTeam(String teamId) {
        return convertToDomaionObject(etterlevelseDokumentasjonRepo.getEtterlevelseDokumentasjonerForTeam(List.of(teamId)));
    }

    public List<EtterlevelseDokumentasjon> searchEtterlevelseDokumentasjon(String searchParam) {
        if (searchParam.toLowerCase().matches("e[0-9]+(.*)")) {
            return convertToDomaionObject(etterlevelseDokumentasjonRepo.searchEtterlevelseDokumentasjon(searchParam.substring(1)));
        } else {
            return convertToDomaionObject(etterlevelseDokumentasjonRepo.searchEtterlevelseDokumentasjon(searchParam));
        }
    }

    public List<EtterlevelseDokumentasjon> getByFilter(EtterlevelseDokumentasjonFilter filter) {
        if (!StringUtils.isBlank(filter.getId())) {
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = storage.get(UUID.fromString(filter.getId()));
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
        return convertToDomaionObject(etterlevelseDokumentasjonRepo.findBy(filter));
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon save(EtterlevelseDokumentasjonRequest request) {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new EtterlevelseDokumentasjon();
        etterlevelseDokumentasjon.merge(request);
        if (!request.isUpdate()) {
            etterlevelseDokumentasjon.setEtterlevelseNummer(etterlevelseDokumentasjonRepo.nextEtterlevelseDokumentasjonNummer());
        }
        return storage.save(etterlevelseDokumentasjon);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon saveAndCreateRelationWithEtterlevelseCopy(UUID fromDocumentID, EtterlevelseDokumentasjonWithRelationRequest request) {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = new EtterlevelseDokumentasjon();
        etterlevelseDokumentasjon.merge(request);
        etterlevelseDokumentasjon.setEtterlevelseNummer(etterlevelseDokumentasjonRepo.nextEtterlevelseDokumentasjonNummer());
        log.info("creating new Etterlevelse document with relation");
        var newEtterlevelseDokumentasjon = storage.save(etterlevelseDokumentasjon);

        etterlevelseService.copyEtterlevelse(fromDocumentID.toString(), newEtterlevelseDokumentasjon.getId().toString());

        var newDocumentRelation = documentRelationService.save(
                DocumentRelationRequest.builder()
                        .update(false)
                        .fromDocument(fromDocumentID.toString())
                        .toDocument(newEtterlevelseDokumentasjon.getId().toString())
                        .relationType(request.getRelationType())
                        .build());

        log.info("Created new relation with fromId = {}, toId = {} with relation type = {}", newDocumentRelation.getFromDocument(), newDocumentRelation.getToDocument(), newDocumentRelation.getRelationType().name());

        return newEtterlevelseDokumentasjon;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon deleteEtterlevelseDokumentasjonAndAllChildren(UUID id) {
        log.info("deleting etterlevelse metadata connected to etterlevelse dokumentasjon with id={}", id);
        etterlevelseMetadataService.deleteByEtterlevelseDokumentasjonId(id.toString());

        log.info("deleting etterlevelse arkiv connected to etterlevelse dokumentasjon with id={}", id);
        etterlevelseArkivService.deleteByEtterlevelseDokumentsjonId(id.toString());

        log.info("deleting etterlevelse connected to etterlevelse dokumentasjon with id={}", id);
        etterlevelseService.deleteByEtterlevelseDokumentasjonId(id.toString());

        return delete(id);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseDokumentasjon delete(UUID id) {
        return storage.delete(id);
    }

    public List<EtterlevelseDokumentasjon> getByBehandlingId(List<String> ids) {
        return convertToDomaionObject(etterlevelseDokumentasjonRepo.findByBehandlingIds(ids));
    }

    public List<EtterlevelseDokumentasjon> getByVirkemiddelId(List<String> ids) {
        return convertToDomaionObject(etterlevelseDokumentasjonRepo.findByVirkemiddelIds(ids));
    }

    public EtterlevelseDokumentasjonResponse getEtterlevelseDokumentasjonWithTeamAndBehandlingAndResourceData(UUID uuid) {
        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse = addBehandlingAndTeamsDataAndResourceData(get(uuid).toResponse());

        boolean resourceIsEmpty = etterlevelseDokumentasjonResponse.getResources() == null || etterlevelseDokumentasjonResponse.getResources().isEmpty();
        boolean teamIsEmpty = etterlevelseDokumentasjonResponse.getTeams() == null || etterlevelseDokumentasjonResponse.getTeams().isEmpty();

        boolean resourceIsNotEmpty = etterlevelseDokumentasjonResponse.getResources() != null && !etterlevelseDokumentasjonResponse.getResources().isEmpty();
        boolean teamIsNotEmpty = etterlevelseDokumentasjonResponse.getTeams() != null && !etterlevelseDokumentasjonResponse.getTeams().isEmpty();

        if(resourceIsEmpty && teamIsEmpty) {
            etterlevelseDokumentasjonResponse.setHasCurrentUserAccess(true);
        } else {
            List<String> memeberList = new ArrayList<>();

            var currentUser = SecurityUtils.getCurrentIdent();
            if(resourceIsNotEmpty) {
                memeberList.addAll(etterlevelseDokumentasjonResponse.getResources());
            }

            if(teamIsNotEmpty) {
                etterlevelseDokumentasjonResponse.getTeamsData().forEach((team) -> {
                    if (team.getMembers() != null && !team.getMembers().isEmpty()) {
                        memeberList.addAll(team.getMembers().stream().map(MemberResponse::getNavIdent).toList());
                    }
                });
            }

            boolean currentUserHasAccess = memeberList.contains(currentUser) || SecurityUtils.isAdmin();

            etterlevelseDokumentasjonResponse.setHasCurrentUserAccess(currentUserHasAccess);
        }
        return etterlevelseDokumentasjonResponse;
    }

    public List<EtterlevelseDokumentasjon> getAllWithValidBehandling() {
        return convertToDomaionObject(etterlevelseDokumentasjonRepo.getAllEtterlevelseDokumentasjonWithValidBehandling());
    }

    public Page<EtterlevelseDokumentasjon> getAll(Pageable pageable) {
        return storage.getAll(EtterlevelseDokumentasjon.class, pageable);
    }

    public List<EtterlevelseDokumentasjon> findByKravRelevans(List<String> kravRelevans) {
        return convertToDomaionObject(etterlevelseDokumentasjonRepo.findByKravRelevans(kravRelevans));
    }

    // Does not update DB
    public EtterlevelseDokumentasjonResponse addBehandlingAndTeamsDataAndResourceData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        if (etterlevelseDokumentasjonResponse.getBehandlingIds() != null && !etterlevelseDokumentasjonResponse.getBehandlingIds().isEmpty()) {
            addBehandlingData(etterlevelseDokumentasjonResponse);
        }
        if (etterlevelseDokumentasjonResponse.getTeams() != null && !etterlevelseDokumentasjonResponse.getTeams().isEmpty()) {
            addTeamsData(etterlevelseDokumentasjonResponse);
        }
        if (etterlevelseDokumentasjonResponse.getResources() != null && !etterlevelseDokumentasjonResponse.getResources().isEmpty()) {
            addResourcesData(etterlevelseDokumentasjonResponse);
        }
        return etterlevelseDokumentasjonResponse;
    }

    public void addBehandlingData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        List<Behandling> behandlingList = new ArrayList<>();
        etterlevelseDokumentasjonResponse.getBehandlingIds().forEach((behandlingId) -> {
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
        etterlevelseDokumentasjonResponse.setBehandlinger(behandlingList);
    }

    public void addTeamsData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        List<TeamResponse> teamsData = new ArrayList<>();
        etterlevelseDokumentasjonResponse.getTeams().forEach((teamId) -> {
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
        etterlevelseDokumentasjonResponse.setTeamsData(teamsData);
    }

    public void addResourcesData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        List<Resource> resourcessData = new ArrayList<>();
        etterlevelseDokumentasjonResponse.getResources().forEach((ident) -> {
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
        etterlevelseDokumentasjonResponse.setResourcesData(resourcessData);
    }

}
