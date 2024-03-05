package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.arkivering.EtterlevelseArkivService;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelsemetadata.EtterlevelseMetadataService;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.TeamResponse;
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

    public List<EtterlevelseDokumentasjon> getByVirkemiddelId(List<String>ids) {
        return convertToDomaionObject(etterlevelseDokumentasjonRepo.findByVirkemiddelIds(ids));
    }

    public EtterlevelseDokumentasjonResponse getEtterlevelseDokumentasjonWithTeamAndBehandlingData(UUID uuid) {
        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse = get(uuid).toResponse();
        return addBehandlingAndTeamsData(etterlevelseDokumentasjonResponse);
    }

    public List<EtterlevelseDokumentasjon> getAllWithValidBehandling(){
        return convertToDomaionObject(etterlevelseDokumentasjonRepo.getAllEtterlevelseDokumentasjonWithValidBehandling());
    }

    public Page<EtterlevelseDokumentasjon> getAll(Pageable pageable) {
        return storage.getAll(EtterlevelseDokumentasjon.class, pageable);
    }

    // Does not update DB
    public EtterlevelseDokumentasjonResponse addBehandlingAndTeamsData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        if (etterlevelseDokumentasjonResponse.getBehandlingIds() != null && !etterlevelseDokumentasjonResponse.getBehandlingIds().isEmpty()) {
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
        if (etterlevelseDokumentasjonResponse.getTeams() != null && !etterlevelseDokumentasjonResponse.getTeams().isEmpty()) {
            List<TeamResponse> teamsData = new ArrayList<>();
            etterlevelseDokumentasjonResponse.getTeams().forEach((teamId) -> {
                var teamData = teamcatTeamClient.getTeam(teamId);
                if (teamData.isPresent()) {
                    teamsData.add(teamData.get().toResponse());
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
        return etterlevelseDokumentasjonResponse;
    }

}
