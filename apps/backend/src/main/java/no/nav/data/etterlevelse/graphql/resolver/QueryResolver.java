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

    public KravResponse krav(UUID id) {
        log.info("krav {}", id);

        try {
            return kravService.get(id).convertToResponse();
        } catch (NotFoundException e) {
            return null;
        }
    }

    public KravResponse kravForNummer(int nummer, Integer versjon) {
        log.info("krav {}.{}", nummer, versjon);

        return kravService.getByKravNummer(nummer, versjon).map(Krav::convertToResponse)
                .orElse(null);
    }

    public List<KravResponse> kravFor(String relevans) {
        var filter = KravFilter.builder()
                .relevans(relevans)
                .build();
        log.info("krav filter {}", filter);

        return convert(kravService.getByFilter(filter), Krav::convertToResponse);
    }

    public EtterlevelseResponse etterlevelse(UUID id) {
        log.info("etterlevelse {}", id);

        return etterlevelseService.get(id).convertToResponse();
    }
}
