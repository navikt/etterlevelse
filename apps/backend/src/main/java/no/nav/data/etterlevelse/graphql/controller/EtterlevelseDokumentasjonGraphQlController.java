package no.nav.data.etterlevelse.graphql.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.AuditVersionService;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonFilter;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonGraphQlResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonStats;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.dto.KravGraphQlResponse;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.common.utils.StreamUtils.toMap;

@Slf4j
@RequiredArgsConstructor
@Controller
public class EtterlevelseDokumentasjonGraphQlController {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final KravService kravService;
    private final TeamcatTeamClient teamsService;
    private final TeamcatResourceClient resourceService;
    private final BehandlingService behandlingService;
    private final EtterlevelseService etterlevelseService;
    private final AuditVersionService auditVersionService;

    @QueryMapping
    public RestResponsePage<EtterlevelseDokumentasjonGraphQlResponse> etterlevelseDokumentasjon(
            @Argument EtterlevelseDokumentasjonFilter filter, 
            @Argument Integer pageNumber, 
            @Argument Integer pageSize
    ) {
        log.info("etterlevelseDokumentasjon filter {}", filter);
        var pageInput = new PageParameters(pageNumber, pageSize);

        if (filter == null || filter.isEmpty()) {
            var resp = etterlevelseDokumentasjonService.getAll(pageInput.createPage());

            return new RestResponsePage<>(resp).convert(EtterlevelseDokumentasjonGraphQlResponse::buildFrom);
        }
        if (SecurityUtils.getCurrentUser().isEmpty() && filter.requiresLogin()) {
            return new RestResponsePage<>();
        }

        List<EtterlevelseDokumentasjon> filtered = new ArrayList<>(etterlevelseDokumentasjonService.getByFilter(filter));
        if (filter.getSistRedigert() == null) {
            filtered.sort(Comparator.comparing(EtterlevelseDokumentasjon::getEtterlevelseNummer));
        }
        if (pageSize == 0) {
            return new RestResponsePage<>(filtered).convert(EtterlevelseDokumentasjonGraphQlResponse::buildFrom);
        }
        return pageInput.pageFrom(filtered).convert(EtterlevelseDokumentasjonGraphQlResponse::buildFrom);
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public List<TeamResponse> teamsData(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjonResponse) {
        var teams = getTeams(etterlevelseDokumentasjonResponse.getTeams());
        return new ArrayList<>(teams.values());
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public List<Resource> resourcesData(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjonResponse) {
        var resources = resourceService.getResources(etterlevelseDokumentasjonResponse.getResources());
        return new ArrayList<>(resources.values());
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public List<Behandling> behandlinger(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjonResponse) {
        var behandlinger = behandlingService.findAllByIdMapped(etterlevelseDokumentasjonResponse.getBehandlingIds());
        return new ArrayList<>(behandlinger.values());
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public List<EtterlevelseResponse> etterlevelser(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjon) {
        return convert(etterlevelseService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId()), EtterlevelseResponse::buildFrom);
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public LocalDateTime sistEndretEtterlevelse(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjon) {
        var etterlevelser = etterlevelseService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId());
        return sistEndret(etterlevelser);
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public LocalDateTime sistEndretEtterlevelseAvMeg(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjon) {
        var etterlevelser = auditVersionService.findLatestEtterlevelseByEtterlevelseDokumentIdAndCurrentUser(etterlevelseDokumentasjon.getId().toString());
        return sistEndretAudit(etterlevelser);
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public LocalDateTime sistEndretDokumentasjon(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjon) {
        return etterlevelseDokumentasjon.getChangeStamp().getLastModifiedDate();
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public LocalDateTime sistEndretDokumentasjonAvMeg(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjon) {
        var etterlevelser = auditVersionService.findLatestEtterlevelseDokumentIdAndCurrentUser(etterlevelseDokumentasjon.getId().toString());
        return sistEndretAudit(etterlevelser);
    }

    @SchemaMapping(typeName = "EtterlevelseDokumentasjon")
    public EtterlevelseDokumentasjonStats stats(EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjon) {
        List<KravGraphQlResponse> krav;
        List<KravGraphQlResponse> irrelevantKrav;

        if (etterlevelseDokumentasjon.isKnyttetTilVirkemiddel() && (etterlevelseDokumentasjon.getVirkemiddelId() != null)) {
            krav = convert(kravService.findForEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId().toString(), etterlevelseDokumentasjon.getVirkemiddelId()), KravGraphQlResponse::buildFrom);
            irrelevantKrav = convert(kravService.findForEtterlevelseDokumentasjonIrrelevans(etterlevelseDokumentasjon.getId().toString(), etterlevelseDokumentasjon.getVirkemiddelId()), KravGraphQlResponse::buildFrom);
        } else {
            krav = convert(kravService.findForEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId().toString()), KravGraphQlResponse::buildFrom);
            irrelevantKrav = convert(kravService.findForEtterlevelseDokumentasjonIrrelevans(etterlevelseDokumentasjon.getId().toString()), KravGraphQlResponse::buildFrom);
        }

        var relevantKrav = krav.stream().filter(k -> k.getStatus() == KravStatus.AKTIV).toList();

        var irrelevant = irrelevantKrav.stream().filter(i -> !relevantKrav.contains(i)).toList();

        var utgaattKrav = krav.stream().filter(k -> k.getStatus() == KravStatus.UTGAATT).toList();

        return EtterlevelseDokumentasjonStats.builder()
                .relevantKrav(relevantKrav)
                .irrelevantKrav(irrelevant)
                .utgaattKrav(utgaattKrav)
                .lovStats(convert(CodelistService.getCodelist(ListName.LOV), c -> EtterlevelseDokumentasjonStats.LovStats.builder()
                        .lovCode(c.toResponse())
                        .relevantKrav(filter(relevantKrav, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .irrelevantKrav(filter(irrelevant, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .utgaattKrav(filter(utgaattKrav, k -> safeStream(k.getRegelverk()).anyMatch(r -> r.getLov().getCode().equals(c.getCode()))))
                        .build()))
                .build();
    }

    private LocalDateTime sistEndret(List<Etterlevelse> etterlevelser) {
        return etterlevelser.stream()
                .map(e -> e.getLastModifiedDate())
                .max(Comparator.comparing(Function.identity()))
                .orElse(null);
    }

    private LocalDateTime sistEndretAudit(List<AuditVersion> etterlevelser) {
        return etterlevelser.stream()
                .map(AuditVersion::getTime)
                .max(Comparator.comparing(Function.identity()))
                .orElse(null);
    }

    private Map<String, TeamResponse> getTeams(Collection<String> ids) {
        var teams = filter(teamsService.getAllTeams(), t -> ids.contains(t.getId()));
        List<TeamResponse> teamResponses = convert(teams, Team::toResponseWithMembers);

        teamResponses.forEach(t -> {
            if (t.getProductAreaId() != null && !t.getProductAreaId().isEmpty()) {
                var po = teamsService.getProductArea(t.getProductAreaId());
                po.ifPresent((productArea) -> t.setProductAreaName(productArea.getName()));
            }
        });

        Map<String, TeamResponse> map = toMap(teamResponses, TeamResponse::getId);
        var missing = new ArrayList<>(ids);
        missing.removeAll(map.keySet());
        missing.forEach(id -> map.put(id, new TeamResponse(id)));
        return map;
    }
}
