package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
public class EtterlevelseDokumentasjonService extends DomainService<EtterlevelseDokumentasjon> {

    private final AuditVersionRepository auditRepo;
    private final BehandlingService behandlingService;
    private final TeamcatTeamClient teamcatTeamClient;

    public EtterlevelseDokumentasjonService(AuditVersionRepository auditRepo, BehandlingService behandlingService, TeamcatTeamClient teamcatTeamClient) {
        super(EtterlevelseDokumentasjon.class);
        this.auditRepo = auditRepo;
        this.behandlingService = behandlingService;
        this.teamcatTeamClient = teamcatTeamClient;
    }

    public Page<EtterlevelseDokumentasjon> getAll(PageParameters pageParameters) {
        return etterlevelseDokumentasjonRepo.findAll(pageParameters.createPage()).map(GenericStorage::toEtterlevelseDokumentasjon);
    }

    public List<EtterlevelseDokumentasjon> getEtterlevelseDokumentasjonerByTeam(String teamId) {
        return GenericStorage.to(etterlevelseDokumentasjonRepo.getEtterlevelseDokumentasjonerForTeam(List.of(teamId)),EtterlevelseDokumentasjon.class);
    }

    public List<EtterlevelseDokumentasjon> searchEtterlevelseDokumentasjon(String searchParam) {
        if(searchParam.toLowerCase().matches("e[0-9]+(.*)")) {
            return GenericStorage.to(etterlevelseDokumentasjonRepo.searchEtterlevelseDokumentasjon(searchParam.substring(1)), EtterlevelseDokumentasjon.class);
        } else {
            return GenericStorage.to(etterlevelseDokumentasjonRepo.searchEtterlevelseDokumentasjon(searchParam),EtterlevelseDokumentasjon.class );
        }
    }

    public List<EtterlevelseDokumentasjon> getByFilter(EtterlevelseDokumentasjonFilter filter) {
        if (!StringUtils.isBlank(filter.getId())) {
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = storage.get(UUID.fromString(filter.getId()), EtterlevelseDokumentasjon.class);
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
        return GenericStorage.to(etterlevelseDokumentasjonRepo.findBy(filter),EtterlevelseDokumentasjon.class);
    }

    public EtterlevelseDokumentasjon save(EtterlevelseDokumentasjonRequest request) {

        var etterlevelseDokumentasjon = request.isUpdate() ? storage.get(request.getIdAsUUID(), EtterlevelseDokumentasjon.class) : new EtterlevelseDokumentasjon();

        etterlevelseDokumentasjon.convert(request);

        if (!request.isUpdate()) {
            etterlevelseDokumentasjon.setEtterlevelseNummer(etterlevelseDokumentasjonRepo.nextEtterlevelseDokumentasjonNummer());
        }

        return storage.save(etterlevelseDokumentasjon);
    }

    public EtterlevelseDokumentasjon delete(UUID id) {
        return storage.delete(id, EtterlevelseDokumentasjon.class);
    }

    public List<EtterlevelseDokumentasjon> getByBehandlingId(List<String> ids) {
        return GenericStorage.to(etterlevelseDokumentasjonRepo.findByBehandlingIds(ids), EtterlevelseDokumentasjon.class);
    }

    public List<EtterlevelseDokumentasjon> getByVirkemiddelId(List<String>ids) {
        return GenericStorage.to(etterlevelseDokumentasjonRepo.findByVirkemiddelIds(ids), EtterlevelseDokumentasjon.class);
    }

    public EtterlevelseDokumentasjonResponse getEtterlevelseDokumentasjonWithTeamAndBehandlingData(UUID uuid) {
        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse = get(uuid).toResponse();
        return addBehandlingAndTeamsData(etterlevelseDokumentasjonResponse);
    }

    public EtterlevelseDokumentasjonResponse addBehandlingAndTeamsData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse){
        if(etterlevelseDokumentasjonResponse.getBehandlingIds() != null && !etterlevelseDokumentasjonResponse.getBehandlingIds().isEmpty()) {
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
        if(etterlevelseDokumentasjonResponse.getTeams() != null && !etterlevelseDokumentasjonResponse.getTeams().isEmpty()){
            List<TeamResponse> teamsData = new ArrayList<>();
            etterlevelseDokumentasjonResponse.getTeams().forEach((teamId) -> {
                var teamData = teamcatTeamClient.getTeam(teamId);
                if(teamData.isPresent()){
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
