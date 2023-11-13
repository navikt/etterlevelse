package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringFilter;
import no.nav.data.etterlevelse.kravprioritering.dto.KravPrioriteringResponse;
import org.springframework.stereotype.Component;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Component
@RequiredArgsConstructor
public class KravPrioriteringFiledResolver implements GraphQLResolver<KravPrioriteringResponse> {

    private final EtterlevelseService etterlevelseService;
    private final KravService kravService;

    public List<EtterlevelseResponse> etterlevelser(KravPrioriteringResponse kravPrioritering, boolean onlyForEtterlevelseDokumentasjon, DataFetchingEnvironment env) {
        Integer nummer = kravPrioritering.getKravNummer();
        Integer versjon = kravPrioritering.getKravVersjon();
        log.info("etterlevelse for krav {}.{}", nummer, versjon);

        var etterlevelser = etterlevelseService.getByKravNummer(nummer, versjon);

        if (onlyForEtterlevelseDokumentasjon) {
            String etterlevelseDokumentasjonId = KravPrioriteringFilter.get(env, KravPrioriteringFilter.Fields.etterlevelseDokumentasjonId);
            if(etterlevelseDokumentasjonId != null) {
                etterlevelser = filter(etterlevelser, e -> etterlevelseDokumentasjonId.equals(e.getEtterlevelseDokumentasjonId()));
            }
        }

        return convert(etterlevelser, Etterlevelse::toResponse);
    }

    public String kravNavn(KravPrioriteringResponse kravPrioritering) {
        Integer nummer = kravPrioritering.getKravNummer();
        Integer versjon = kravPrioritering.getKravVersjon();
        log.info("krav navn for krav {}.{}", nummer, versjon);

        var krav = kravService.getByKravNummer(nummer, versjon);

        return krav.map(Krav::getNavn).orElse("");
    }
}
