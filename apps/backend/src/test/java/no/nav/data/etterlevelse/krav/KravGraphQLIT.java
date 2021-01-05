package no.nav.data.etterlevelse.krav;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.SneakyThrows;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.graphql.GraphQLTestBase;
import no.nav.data.integration.behandling.BkatMocks;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static no.nav.data.graphql.GraphQLAssert.assertThat;


class KravGraphQLIT extends GraphQLTestBase {

    private final Behandling behandling = BkatMocks.processMockResponse().convertToBehandling();
    private final ObjectMapper om = JsonUtils.getObjectMapper();

    @Test
    @SneakyThrows
    void getKrav() {
        var krav = storageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .kontaktPersoner(List.of("A123456", "A123457", "notfound"))
                .build());
        storageService.save(Etterlevelse.builder()
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .behandlingId(behandling.getId())
                .build());

        var var = Map.of("nummer", krav.getKravNummer().toString(), "versjon", krav.getKravVersjon().toString());
        var response = graphQLTestTemplate.perform("graphqltest/krav_get.graphql", vars(var));

        assertThat(response, "kravByNummer")
                .hasNoErrors()
                .hasField("navn", "Krav 1")
                .hasSize("kontaktPersoner", 3)
                .hasField("kontaktPersoner[0]", "A123456")
                .hasField("kontaktPersoner[1]", "A123457")
                .hasField("kontaktPersoner[2]", "notfound")
                .hasSize("kontaktPersonerData", 3)
                .hasField("kontaktPersonerData[0].fullName", "Given Family")
                .hasField("kontaktPersonerData[1].fullName", "Given Family")
                .hasField("kontaktPersonerData[2].fullName", null)
                .hasField("etterlevelser[0].behandlingId", behandling.getId())
                .hasField("etterlevelser[0].behandling.navn", behandling.getNavn());
    }

    @Test
    @SneakyThrows
    void kravFilter() {
        var krav = storageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .build());
        storageService.save(Krav.builder()
                .navn("Krav 2").kravNummer(51).kravVersjon(1)
                .relevansFor(List.of("INNSYN"))
                .build());

        var var = Map.of("relevans", "SAK", "nummer", "50");
        var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

        assertThat(response, "krav")
                .hasNoErrors()
                .hasSize(1)
                .hasField("[0].id", krav.getId().toString());
    }

    @Test
    @SneakyThrows
    void kravPaged() {
        for (int i = 0; i < 10; i++) {
            storageService.save(Krav.builder()
                    .navn("Krav " + i).kravNummer(50 + i).kravVersjon(1)
                    .relevansFor(List.of("SAK"))
                    .build());
        }

        // all
        assertThat(graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(Map.of("relevans", "SAK"))), "krav")
                .hasNoErrors().hasSize(10);

        // size 3, 2nd page
        assertThat(graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(Map.of("pageNumber", "1", "pageSize", "3"))), "krav")
                .hasNoErrors().hasSize(3)
                .hasField("[0].navn", "Krav 3")
                .hasField("[1].navn", "Krav 4")
                .hasField("[2].navn", "Krav 5");

        // size 3, 2nd page with filter
        assertThat(graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(Map.of("relevans", "SAK", "pageNumber", "1", "pageSize", "3"))), "krav")
                .hasNoErrors().hasSize(3)
                .hasField("[0].navn", "Krav 3")
                .hasField("[1].navn", "Krav 4")
                .hasField("[2].navn", "Krav 5");
    }

    private ObjectNode vars(Map<String, String> map) {
        var on = om.createObjectNode();
        map.entrySet().forEach(e -> on.put(e.getKey(), e.getValue()));
        return on;
    }
}
