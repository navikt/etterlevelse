package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.TilbakemeldingService;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter.Fields;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse;
import no.nav.data.integration.begrep.BegrepService;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import org.springframework.stereotype.Component;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Component
@RequiredArgsConstructor
public class KravFieldResolver implements GraphQLResolver<KravResponse> {

    private final EtterlevelseService etterlevelseService;
    private final TilbakemeldingService tilbakemeldingService;
    private final BegrepService begrepService;

    public List<EtterlevelseResponse> etterlevelser(KravResponse krav, boolean onlyForBehandling, DataFetchingEnvironment env) {
        Integer nummer = krav.getKravNummer();
        Integer versjon = krav.getKravVersjon();
        log.info("etterlevelse for krav {}.{}", nummer, versjon);

        var etterlevelser = etterlevelseService.getByKravNummer(nummer, versjon);
        if (onlyForBehandling) {
            String behandlingId = KravFilter.get(env, Fields.behandlingId);
            if (behandlingId != null) {
                etterlevelser = filter(etterlevelser, e -> behandlingId.equals(e.getBehandlingId()));
            }
        }
        return convert(etterlevelser, Etterlevelse::toResponse);
    }

    public List<TilbakemeldingResponse> tilbakemeldinger(KravResponse krav) {
        var tilbakemeldinger = tilbakemeldingService.getForKrav(krav.getKravNummer(), krav.getKravVersjon());
        return convert(tilbakemeldinger, Tilbakemelding::toResponse);
    }

    public List<BegrepResponse> begreper(KravResponse krav) {
        return convert(krav.getBegrepIder(), begrep -> begrepService.getBegrep(begrep).orElse(null));
    }
}
