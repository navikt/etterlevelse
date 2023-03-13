package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
public class EtterlevelseDokumentasjonService extends DomainService<EtterlevelseDokumentasjon> {

    private final AuditVersionRepository auditRepo;
    private final TeamcatTeamClient teamcatTeamClient;

    public EtterlevelseDokumentasjonService(AuditVersionRepository auditRepo, TeamcatTeamClient teamcatTeamClient) {
        super(EtterlevelseDokumentasjon.class);
        this.auditRepo = auditRepo;
        this.teamcatTeamClient = teamcatTeamClient;
    }

    public Page<EtterlevelseDokumentasjon> getAll(PageParameters pageParameters) {
        return etterlevelseDokumentasjonRepo.findAll(pageParameters.createPage()).map(GenericStorage::toEtterlevelseDokumentasjon);
    }

    public List<EtterlevelseDokumentasjon> getEtterlevelseDokumentasjonerByTeam(String teamId) {
        log.debug("DEBUGGING SEARCH");
        return GenericStorage.to(etterlevelseDokumentasjonRepo.getEtterlevelseDokumentasjonerForTeam(List.of(teamId)),EtterlevelseDokumentasjon.class);
    }

    public List<EtterlevelseDokumentasjon> searchEtterlevelseDokumentasjon(String searchParam) {

        String newSearchParam = searchParam;

        if(searchParam.toLowerCase().matches("e[0-9]+(.*)")) {
           newSearchParam = searchParam.substring(1);
        }

        List<GenericStorage> etterlevelseDokumentasjoner = etterlevelseDokumentasjonRepo.searchEtterlevelseDokumentasjonByTitle(newSearchParam);

        if(StringUtils.isNumeric(searchParam)) {
            etterlevelseDokumentasjoner.addAll(etterlevelseDokumentasjonRepo.searchEtterlevelseDokumentasjonByNumber(newSearchParam));
        }

        return GenericStorage.to(etterlevelseDokumentasjoner, EtterlevelseDokumentasjon.class);
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

}
