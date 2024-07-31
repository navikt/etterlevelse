package no.nav.data.etterlevelse.graphql.controller;

import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.TilbakemeldingService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter.Fields;
import no.nav.data.etterlevelse.krav.dto.KravGraphQlResponse;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingResponse;
import no.nav.data.etterlevelse.kravprioritylist.KravPriorityListService;
import no.nav.data.etterlevelse.virkemiddel.VirkemiddelService;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelResponse;
import no.nav.data.integration.begrep.BegrepService;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StreamUtils.convert;

@RequiredArgsConstructor
@Controller
@Slf4j
public class KravGraphQlController {
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;
    private final TilbakemeldingService tilbakemeldingService;
    private final BegrepService begrepService;
    private final KravPriorityListService kravPriorityListService;
    private final VirkemiddelService virkemiddelService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    @QueryMapping
    public KravGraphQlResponse kravById(@Argument UUID id, @Argument Integer nummer, @Argument Integer versjon) {
        if (id != null) {
            try {
                return KravGraphQlResponse.buildFrom(kravService.get(id));
            } catch (NotFoundException e) {
                return null;
            }
        } else if (nummer != null && versjon != null) {
            return kravService.getByKravNummer(nummer, versjon)
                    .map(KravGraphQlResponse::buildFrom)
                    .orElse(null);
        }
        return null;
    }

    @QueryMapping
    public RestResponsePage<KravGraphQlResponse> krav(@Argument KravFilter filter, @Argument Integer pageNumber, @Argument Integer pageSize) {
        log.info("krav filter {}", filter);
        var pageInput = new PageParameters(pageNumber, pageSize);

        if (filter == null || filter.isEmpty()) {
            return new RestResponsePage<>(kravService.getAll(pageInput.createPage())).convert(KravGraphQlResponse::buildFrom);
        }

        if (filter.getEtterlevelseDokumentasjonId() != null && !filter.getEtterlevelseDokumentasjonId().isEmpty()) {
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(filter.getEtterlevelseDokumentasjonId()));
            if (etterlevelseDokumentasjon.isKnyttetTilVirkemiddel() && etterlevelseDokumentasjon.getVirkemiddelId() != null && !etterlevelseDokumentasjon.getVirkemiddelId().isEmpty()){
                filter.setVirkemiddelId(etterlevelseDokumentasjon.getVirkemiddelId());
            }
        }

        List<Krav> filtered = new ArrayList<>(kravService.getByFilter(filter));
        if (filter.getSistRedigert() == null) {
            filtered.sort(comparing(Krav::getKravNummer).thenComparing(Krav::getKravVersjon));
        }
        if (pageSize == 0) {
            return new RestResponsePage<>(filtered).convert(KravGraphQlResponse::buildFrom);
        }
        return pageInput.pageFrom(filtered).convert(KravGraphQlResponse::buildFrom);
    }


    @SchemaMapping(typeName = "Krav")
    public List<EtterlevelseResponse> etterlevelser(KravGraphQlResponse krav, DataFetchingEnvironment env,  @Argument  boolean onlyForEtterlevelseDokumentasjon, @Argument UUID etterlevelseDokumentasjonId) {
        Integer nummer = krav.getKravNummer();
        Integer versjon = krav.getKravVersjon();
        log.info("etterlevelse for krav {}.{}", nummer, versjon);

        if (onlyForEtterlevelseDokumentasjon || etterlevelseDokumentasjonId != null) {
            String dokumentasjonId = etterlevelseDokumentasjonId != null ? etterlevelseDokumentasjonId.toString() : KravFilter.get(env, Fields.etterlevelseDokumentasjonId);
            if (dokumentasjonId != null) {
                return List.of(etterlevelseService.getByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(dokumentasjonId, krav.getKravNummer(), krav.getKravVersjon()).toResponse());
            }
        } else {
            return convert( etterlevelseService.getByKravNummer(nummer, versjon), Etterlevelse::toResponse);
        }
    }


    @SchemaMapping(typeName = "Krav")
    public List<TilbakemeldingResponse> tilbakemeldinger(KravGraphQlResponse krav) {
        var tilbakemeldinger = tilbakemeldingService.getForKravByNumberAndVersion(krav.getKravNummer(), krav.getKravVersjon());
        return convert(tilbakemeldinger, Tilbakemelding::toResponse);
    }

    @SchemaMapping(typeName = "Krav")
    public List<BegrepResponse> begreper(KravGraphQlResponse krav) {
        return convert(krav.getBegrepIder(), begrep -> begrepService.getBegrep(begrep).orElse(null));
    }

    @SchemaMapping(typeName = "Krav")
    public int prioriteringsId(KravGraphQlResponse krav, DataFetchingEnvironment env) {
        var kravPrioritering = kravPriorityListService.getByTema(KravFilter.get(env, Fields.tema));
        return kravPrioritering.map(kravPriorityList -> kravPriorityList.getPriorityList().indexOf(krav.getKravNummer()) + 1).orElse(0);
    }

    @SchemaMapping(typeName = "Krav")
    public List<KravGraphQlResponse> kravRelasjoner(KravGraphQlResponse krav){
        return convert(krav.getKravIdRelasjoner(), kravId -> KravGraphQlResponse.buildFrom(kravService.get(UUID.fromString(kravId))));
    }

    @SchemaMapping(typeName = "Krav")
    public List<VirkemiddelResponse> virkemidler(KravGraphQlResponse krav) {
        return convert(krav.getVirkemiddelIder(), virkemiddel -> virkemiddelService.get(UUID.fromString(virkemiddel)).toResponse());
    }
}
