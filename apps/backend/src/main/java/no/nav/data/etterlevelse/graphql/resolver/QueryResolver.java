package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLQueryResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.behandling.dto.BehandlingFilter;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.util.Comparator.comparing;

@Slf4j
@Component
@RequiredArgsConstructor
public class QueryResolver implements GraphQLQueryResolver {

    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;
    private final BehandlingService behandlingService;

    public KravResponse kravById(UUID id, Integer nummer, Integer versjon) {
        if (id != null) {
            try {
                return kravService.get(id).toResponse();
            } catch (NotFoundException e) {
                return null;
            }
        } else if (nummer != null && versjon != null) {
            return kravService.getByKravNummer(nummer, versjon)
                    .map(Krav::toResponse)
                    .orElse(null);
        }
        return null;
    }

    public RestResponsePage<KravResponse> krav(KravFilter filter, Integer page, Integer pageSize) {
        log.info("krav filter {}", filter);
        var pageInput = new PageParameters(page, pageSize);

        if (filter == null || filter.isEmpty()) {
            return new RestResponsePage<>(kravService.getAll(pageInput.createPage())).convert(Krav::toResponse);
        }

        List<Krav> filtered = new ArrayList<>(kravService.getByFilter(filter));
        if (filter.getSistRedigert() == null) {
            filtered.sort(comparing(Krav::getKravNummer).thenComparing(Krav::getKravVersjon));
        }
        var all = pageSize == 0;
        if (all) {
            return new RestResponsePage<>(filtered).convert(Krav::toResponse);
        }
        return pageInput.pageFrom(filtered).convert(Krav::toResponse);
    }

    public RestResponsePage<Behandling> behandling(BehandlingFilter filter, Integer page, Integer pageSize) {
        log.info("behandling filter {}", filter);
        var pageInput = new PageParameters(page, pageSize);

        if (filter == null || filter.isEmpty()) {
            return behandlingService.getAll(pageInput.createPage());
        }
        if (SecurityUtils.getCurrentUser().isEmpty() && filter.requiresLogin()) {
            return new RestResponsePage<>();
        }

        List<Behandling> filtered = new ArrayList<>(behandlingService.getByFilter(filter));
        if (filter.getSistRedigert() == null) {
            filtered.sort(comparing(Behandling::getNummer));
        }
        var all = pageSize == 0;
        if (all) {
            return new RestResponsePage<>(filtered);
        }
        return pageInput.pageFrom(filtered);
    }

    public EtterlevelseResponse etterlevelseById(UUID id) {
        log.info("etterlevelse {}", id);

        return etterlevelseService.get(id).toResponse();
    }
}
