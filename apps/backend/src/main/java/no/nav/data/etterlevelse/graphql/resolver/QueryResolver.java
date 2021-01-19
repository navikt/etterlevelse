package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLQueryResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
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

import java.util.List;
import java.util.UUID;

import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Component
@RequiredArgsConstructor
public class QueryResolver implements GraphQLQueryResolver {

    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;
    private final BehandlingService behandlingService;

    public KravResponse kravById(UUID id) {
        log.info("krav {}", id);

        try {
            return kravService.get(id).convertToResponse();
        } catch (NotFoundException e) {
            return null;
        }
    }

    public KravResponse kravByNummer(int nummer, Integer versjon) {
        log.info("krav {}.{}", nummer, versjon);

        return kravService.getByKravNummer(nummer, versjon).map(Krav::convertToResponse)
                .orElse(null);
    }

    public List<KravResponse> krav(KravFilter filter, Integer page, Integer pageSize) {
        log.info("krav filter {}", filter);
        var pageInput = new PageParameters(page, pageSize);

        if (filter == null || filter.isEmpty()) {
            return convert(kravService.getAll(pageInput.createPage()).getContent(), Krav::convertToResponse);
        }

        List<Krav> filtered = kravService.getByFilter(filter);
        filtered.sort(comparing(Krav::getKravNummer).thenComparing(Krav::getKravVersjon));
        var all = pageSize == 0;
        if (all) {
            return convert(filtered, Krav::convertToResponse);
        }
        return convert(pageInput.sublist(filtered), Krav::convertToResponse);
    }

    public RestResponsePage<Behandling> behandling(BehandlingFilter filter, Integer page, Integer pageSize) {
        log.info("behandling filter {}", filter);
        var pageInput = new PageParameters(page, pageSize);

        if (filter == null || filter.isEmpty()) {
            return behandlingService.getAll(pageInput.createPage());
        }

        List<Behandling> filtered = behandlingService.getByFilter(filter);
        filtered.sort(comparing(Behandling::getNummer));
        var all = pageSize == 0;
        if (all) {
            return new RestResponsePage<>(filtered);
        }
        return pageInput.pageFrom(filtered);
    }

    public EtterlevelseResponse etterlevelseById(UUID id) {
        log.info("etterlevelse {}", id);

        return etterlevelseService.get(id).convertToResponse();
    }
}
