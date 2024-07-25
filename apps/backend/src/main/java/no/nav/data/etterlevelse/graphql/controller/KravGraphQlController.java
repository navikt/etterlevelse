package no.nav.data.etterlevelse.graphql.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.dto.KravGraphQlResponse;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;

@RequiredArgsConstructor
@Controller
@Slf4j
public class KravGraphQlController {
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;
    @QueryMapping
    public KravGraphQlResponse kravById(@Argument UUID id, @Argument Integer nummer, @Argument Integer versjon) {
        if (id != null) {
            try {
                return kravService.get(id).toGraphQlResponse();
            } catch (NotFoundException e) {
                return null;
            }
        } else if (nummer != null && versjon != null) {
            var resp = kravService.getByKravNummer(nummer, versjon)
                    .map(Krav::toGraphQlResponse)
                    .orElse(null);
            return resp;
        }
        return null;
    }

    @SchemaMapping(typeName = "Krav")
    public List<EtterlevelseResponse> etterlevelser(KravGraphQlResponse krav, @Argument  boolean onlyForEtterlevelseDokumentasjon, @Argument UUID etterlevelseDokumentasjonId) {
        Integer nummer = krav.getKravNummer();
        Integer versjon = krav.getKravVersjon();
        log.info("etterlevelse for krav {}.{}", nummer, versjon);

        var etterlevelser = etterlevelseService.getByKravNummer(nummer, versjon);

        if (onlyForEtterlevelseDokumentasjon && etterlevelseDokumentasjonId != null) {
            String dokumentasjonId =  etterlevelseDokumentasjonId.toString();

            if(dokumentasjonId != null) {
                etterlevelser = filter(etterlevelser, e -> dokumentasjonId.equals(e.getEtterlevelseDokumentasjonId()));
            }
        }

        return convert(etterlevelser, Etterlevelse::toResponse);
    }
}
