package no.nav.data.etterlevelse.graphql.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.AuditVersionService;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonGraphQlResponse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.Vurdering;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemeldingFilter;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemeldingGraphqlResponse;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Slf4j
@RequiredArgsConstructor
@Controller
public class PvoTilbakemeldingGraphQlController {
    private final PvoTilbakemeldingService pvoTilbakemeldingService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private  final PvkDokumentService pvkDokumentService;
    private final AuditVersionService auditVersionService;
    private final TeamcatResourceClient teamcatResourceClient;

    @QueryMapping
    public RestResponsePage<PvoTilbakemeldingGraphqlResponse> pvoTilbakemelding(
            @Argument PvoTilbakemeldingFilter filter,
            @Argument Integer pageNumber,
            @Argument Integer pageSize
    ) {
        log.info("pvotilbakemelding filter {}", filter);
        var pageInput = new PageParameters(pageNumber, pageSize);

        if (filter == null || filter.isEmpty()) {
            var resp = pvoTilbakemeldingService.getAll(pageInput.createPage());

            return new RestResponsePage<>(resp).convert(PvoTilbakemeldingGraphqlResponse::buildFrom);
        }
        if (SecurityUtils.getCurrentUser().isEmpty()) {
            return new RestResponsePage<>();
        }

        List<PvoTilbakemelding> filtered = new ArrayList<>(pvoTilbakemeldingService.getByFilter(filter));
        if (filter.getSistRedigert() == null) {
            filtered.sort(Comparator.comparing(PvoTilbakemelding::getId));
        }
        if (pageSize == 0) {
            return new RestResponsePage<>(filtered).convert(PvoTilbakemeldingGraphqlResponse::buildFrom);
        }
        return pageInput.pageFrom(filtered).convert(PvoTilbakemeldingGraphqlResponse::buildFrom);
    }

    @SchemaMapping(typeName = "PvoTilbakemelding")
    public String pvkDokumentStatus(PvoTilbakemeldingGraphqlResponse pvoTilbakemeldingGraphqlResponse) {
        var pvkDokument = pvkDokumentService.get(UUID.fromString(pvoTilbakemeldingGraphqlResponse.getPvkDokumentId()));
        return pvkDokument.getStatus().name();
    }

    @SchemaMapping(typeName = "PvoTilbakemelding")
    public UUID etterlevelseDokumentasjonId(PvoTilbakemeldingGraphqlResponse pvoTilbakemeldingGraphqlResponse) {
        var pvkDokument = pvkDokumentService.get(UUID.fromString(pvoTilbakemeldingGraphqlResponse.getPvkDokumentId()));
        return pvkDokument.getEtterlevelseDokumentId();
    }

    @SchemaMapping(typeName = "PvoTilbakemelding")
    public EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjonData(PvoTilbakemeldingGraphqlResponse pvoTilbakemeldingGraphqlResponse) {
        var etterlevelseDokumentasjonId = pvkDokumentService.get(UUID.fromString(pvoTilbakemeldingGraphqlResponse.getPvkDokumentId())).getEtterlevelseDokumentId();
        var etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(etterlevelseDokumentasjonId);
        return EtterlevelseDokumentasjonGraphQlResponse.buildFrom(etterlevelseDokumentasjon);
    }

    @SchemaMapping(typeName = "PvoTilbakemelding")
    public LocalDateTime sistEndretAvMeg(PvoTilbakemeldingGraphqlResponse pvoTilbakemeldingGraphqlResponse) {
        var pvoTilbakemeldinger = auditVersionService.findLatestPvoTilbakemeldingIdAndCurrentUser(pvoTilbakemeldingGraphqlResponse.getId().toString());
        return sistEndretAudit(pvoTilbakemeldinger);
    }

    @SchemaMapping(typeName = "Vuredering", field = "ansvarligData")
    public List<Resource> ansvarligData(Vurdering vurdering) {
        var resources = teamcatResourceClient.getResources(vurdering.getAnsvarlig());
        return new ArrayList<>(resources.values());
    }

    @SchemaMapping(typeName = "PvoTilbakemelding")
    public Integer antallInnsendingTilPvo(PvoTilbakemeldingGraphqlResponse pvoTilbakemeldingGraphqlResponse){
        var pvkDokument = pvkDokumentService.get(UUID.fromString(pvoTilbakemeldingGraphqlResponse.getPvkDokumentId()));
        if (pvkDokument.getPvkDokumentData().getAntallInnsendingTilPvo() != null) {
            return pvkDokument.getPvkDokumentData().getAntallInnsendingTilPvo();
        } else {
            return 0;
        }
    }

    private LocalDateTime sistEndretAudit(List<AuditVersion> etterlevelser) {
        return etterlevelser.stream()
                .map(AuditVersion::getTime)
                .max(Comparator.comparing(Function.identity()))
                .orElse(null);
    }
}
