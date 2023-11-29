package no.nav.data.etterlevelse.graphql.resolver;

import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.TilbakemeldingService;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter.Fields;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse;
import no.nav.data.etterlevelse.kravprioritering.KravPrioriteringService;
import no.nav.data.etterlevelse.virkemiddel.VirkemiddelService;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelResponse;
import no.nav.data.integration.begrep.BegrepService;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Component
@RequiredArgsConstructor
public class KravFieldResolver implements GraphQLResolver<KravResponse> {

    private final EtterlevelseService etterlevelseService;
    private final TilbakemeldingService tilbakemeldingService;
    private final BegrepService begrepService;
    private final VirkemiddelService virkemiddelService;
    private final KravService kravService;
    private final KravPrioriteringService kravPrioriteringService;

    public List<EtterlevelseResponse> etterlevelser(KravResponse krav, boolean onlyForEtterlevelseDokumentasjon, UUID etterlevelseDokumentasjonId, DataFetchingEnvironment env) {
        Integer nummer = krav.getKravNummer();
        Integer versjon = krav.getKravVersjon();
        log.info("etterlevelse for krav {}.{}", nummer, versjon);

        var etterlevelser = etterlevelseService.getByKravNummer(nummer, versjon);

        if (onlyForEtterlevelseDokumentasjon || etterlevelseDokumentasjonId != null) {
            String dokumentasjonId = etterlevelseDokumentasjonId != null ? etterlevelseDokumentasjonId.toString() : KravFilter.get(env, Fields.etterlevelseDokumentasjonId);

            if(dokumentasjonId != null) {
                etterlevelser = filter(etterlevelser, e -> dokumentasjonId.equals(e.getEtterlevelseDokumentasjonId()));
            }
        }

        return convert(etterlevelser, Etterlevelse::toResponse);
    }

    public List<TilbakemeldingResponse> tilbakemeldinger(KravResponse krav) {
        var tilbakemeldinger = tilbakemeldingService.getForKravByNumberAndVersion(krav.getKravNummer(), krav.getKravVersjon());
        return convert(tilbakemeldinger, Tilbakemelding::toResponse);
    }

    public List<BegrepResponse> begreper(KravResponse krav) {
        return convert(krav.getBegrepIder(), begrep -> begrepService.getBegrep(begrep).orElse(null));
    }

    public String prioriteringsId(KravResponse krav) {
        var kravPrioritering = kravPrioriteringService.getByKravNummer(krav.getKravNummer(), krav.getKravVersjon());
        if(!kravPrioritering.isEmpty()){
            return kravPrioritering.get(0).getPrioriteringsId();
        }
        return "";
    }

    public List<KravResponse> kravRelasjoner(KravResponse krav){
        return convert(krav.getKravIdRelasjoner(), kravId -> kravService.get(UUID.fromString(kravId)).toResponse());
    }

    public List<VirkemiddelResponse> virkemidler(KravResponse krav) {
        return convert(krav.getVirkemiddelIder(), virkemiddel -> virkemiddelService.get(UUID.fromString(virkemiddel)).toResponse());
    }
}
