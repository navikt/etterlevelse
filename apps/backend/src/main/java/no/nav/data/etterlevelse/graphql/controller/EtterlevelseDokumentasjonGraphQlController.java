package no.nav.data.etterlevelse.graphql.controller;


import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonStats;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.dto.KravGraphQlResponse;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.domain.Team;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
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

    @QueryMapping
    public RestResponsePage<EtterlevelseDokumentasjonResponse> etterlevelseDokumentasjon(EtterlevelseDokumentasjonFilter filter, Integer page, Integer pageSize) {
        log.info("etterlevelseDokumentasjon filter {}", filter);
        var pageInput = new PageParameters(page, pageSize);

        if (filter == null || filter.isEmpty()) {
            var resp = etterlevelseDokumentasjonService.getAll(pageInput.createPage());

            return new RestResponsePage<>(resp).convert(EtterlevelseDokumentasjon::toResponse);
        }
        if (SecurityUtils.getCurrentUser().isEmpty() && filter.requiresLogin()) {
            return new RestResponsePage<>();
        }

        List<EtterlevelseDokumentasjon> filtered = new ArrayList<>(etterlevelseDokumentasjonService.getByFilter(filter));
        if (filter.getSistRedigert() == null) {
            filtered.sort(Comparator.comparing(EtterlevelseDokumentasjon::getEtterlevelseNummer));
        }
        var all = pageSize == 0;
        if (all) {
            return new RestResponsePage<>(filtered).convert(EtterlevelseDokumentasjon::toResponse);
        }
        return pageInput.pageFrom(filtered).convert(EtterlevelseDokumentasjon::toResponse);
    }



    @SchemaMapping(field = "EtterlevelseDokumentasjon")
    public List<TeamResponse> teamsData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        var teams = getTeams(etterlevelseDokumentasjonResponse.getTeams());
        return new ArrayList<>(teams.values());
    }

    @SchemaMapping(field = "EtterlevelseDokumentasjon")
    public List<Resource> resourcesData(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        var resources = resourceService.getResources(etterlevelseDokumentasjonResponse.getResources());
        return new ArrayList<>(resources.values());
    }

    @SchemaMapping(field = "EtterlevelseDokumentasjon")
    public List<Behandling> behandlinger(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        var behandlinger = behandlingService.findAllByIdMapped(etterlevelseDokumentasjonResponse.getBehandlingIds());
        return new ArrayList<>(behandlinger.values());
    }

    @SchemaMapping(field = "EtterlevelseDokumentasjon")
    public List<EtterlevelseResponse> etterlevelser(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, DataFetchingEnvironment env) {
        return convert(etterlevelseService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId().toString()), Etterlevelse::toResponse);
    }

    @SchemaMapping(field = "EtterlevelseDokumentasjon")
    public LocalDateTime sistEndretEtterlevelse(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, DataFetchingEnvironment env) {
        var etterlevelser = etterlevelseService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId().toString());
        return sistEndret(etterlevelser);
    }

    @SchemaMapping(field = "EtterlevelseDokumentasjon")
    public LocalDateTime sistEndretDokumentasjon(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse) {
        return etterlevelseDokumentasjonResponse.getChangeStamp().getLastModifiedDate();
    }

    @SchemaMapping(field = "EtterlevelseDokumentasjon")
    public EtterlevelseDokumentasjonStats stats(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon) {
        List<KravGraphQlResponse> krav;
        List<KravGraphQlResponse> irrelevantKrav;

        if (etterlevelseDokumentasjon.isKnyttetTilVirkemiddel() && (etterlevelseDokumentasjon.getVirkemiddelId() != null)) {
            krav = convert(kravService.findForEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId().toString(), etterlevelseDokumentasjon.getVirkemiddelId()), Krav::toGraphQlResponse);
            irrelevantKrav = convert(kravService.findForEtterlevelseDokumentasjonIrrelevans(etterlevelseDokumentasjon.getId().toString(), etterlevelseDokumentasjon.getVirkemiddelId()), Krav::toGraphQlResponse);
        } else {
            krav = convert(kravService.findForEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId().toString()), Krav::toGraphQlResponse);
            irrelevantKrav = convert(kravService.findForEtterlevelseDokumentasjonIrrelevans(etterlevelseDokumentasjon.getId().toString()), Krav::toGraphQlResponse);
        }

        var relevantKrav = krav.stream().filter(k -> k.getStatus().equals(KravStatus.AKTIV) ).toList();

        var irrelevant = irrelevantKrav.stream().filter(i -> !relevantKrav.contains(i)).toList();

        var utgaattKrav = krav.stream().filter(k -> k.getStatus().equals(KravStatus.UTGAATT)).toList();

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
                .map(e -> e.getChangeStamp().getLastModifiedDate())
                .max(Comparator.comparing(Function.identity()))
                .orElse(null);
    }

    private Map<String, TeamResponse> getTeams(Collection<String> ids) {
        var teams = filter(teamsService.getAllTeams(), t -> ids.contains(t.getId()));
        List<TeamResponse> teamResponses = convert(teams, Team::toResponseWithMembers);

        teamResponses.forEach(t -> {
            if(t.getProductAreaId() != null && !t.getProductAreaId().isEmpty()) {
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
