package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLQueryResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Component
@RequiredArgsConstructor
public class QueryResolver implements GraphQLQueryResolver {

    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;

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

    public List<KravResponse> krav(KravFilter filter, Integer skip, Integer first) {
        log.info("krav filter {}", filter);

        if (filter == null || filter.isEmpty()) {
            int pageSize = Math.max(Math.min(first, 50), 1);
            int page = Math.max(skip / pageSize - 1, 0);
            return convert(kravService.getAll(PageRequest.of(page, pageSize)).getContent(), Krav::convertToResponse);
        }

        List<Krav> filtered = kravService.getByFilter(filter);
        var actualSkip = Math.min(skip, filtered.size());
        var last = first == 0 ? filtered.size() : Math.min(actualSkip + first, filtered.size());
        return convert(filtered.subList(actualSkip, last), Krav::convertToResponse);
    }

    public EtterlevelseResponse etterlevelseById(UUID id) {
        log.info("etterlevelse {}", id);

        return etterlevelseService.get(id).convertToResponse();
    }
}
