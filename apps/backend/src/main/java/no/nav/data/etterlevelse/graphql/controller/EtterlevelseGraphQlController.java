package no.nav.data.etterlevelse.graphql.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonGraphQlResponse;
import no.nav.data.integration.team.domain.ProductArea;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Controller
public class EtterlevelseGraphQlController {
    private final EtterlevelseService etterlevelseService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final TeamcatTeamClient teamcatTeamClient;

    @QueryMapping
    public EtterlevelseResponse etterlevelseById(@Argument UUID id) {
        log.info("etterlevelse {}", id);
        return EtterlevelseResponse.buildFrom(etterlevelseService.get(id));
    }

    @SchemaMapping(typeName = "Etterlevelse", field = "etterlevelseDokumentasjon")
    public EtterlevelseDokumentasjonGraphQlResponse etterlevelseDokumentasjon(EtterlevelseResponse etterlevelse) {
        if (etterlevelse.getEtterlevelseDokumentasjonId() != null) {
            var edok = etterlevelseDokumentasjonService.get(etterlevelse.getEtterlevelseDokumentasjonId());
            var response = EtterlevelseDokumentasjonGraphQlResponse.buildFrom(edok);

            if (edok.getEtterlevelseDokumentasjonData().getProduktOmradet() != null) {
                var po = teamcatTeamClient.getProductArea(edok.getEtterlevelseDokumentasjonData().getProduktOmradet()).orElse(ProductArea.builder()
                        .id(edok.getEtterlevelseDokumentasjonData().getProduktOmradet())
                        .name("Fant ikke produkt området")
                        .build());;
                        response.setProduktOmradetData(po.toResponse());
            }

            return response;
        } else {
            return EtterlevelseDokumentasjonGraphQlResponse.builder().build();
        }
    }
}
