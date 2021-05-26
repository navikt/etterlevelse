package no.nav.data.etterlevelse.behandling;

import com.graphql.spring.boot.test.GraphQLResponse;
import lombok.SneakyThrows;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.behandling.dto.BehandlingRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.graphql.GraphQLTestBase;
import no.nav.data.integration.behandling.BkatMocks;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static no.nav.data.graphql.GraphQLAssert.assertThat;

public class BehandlingGraphQlIT extends GraphQLTestBase {

    private final Behandling behandling = BkatMocks.processMockResponse().convertToBehandling();

    @Test
    @SneakyThrows
    void behandlingPage() {
        var var = Map.of("pageNumber", "0", "pageSize", "20");
        var response = graphQLTestTemplate.perform("graphqltest/behandling_filter.graphql", vars(var));

        assertThat(response, "behandling")
                .hasNoErrors()
                .hasField("totalElements", "1")
                .hasField("numberOfElements", "1")
                .hasField("content[0].id", behandling.getId());
    }

    @Test
    @SneakyThrows
    void behandlingRelevans() {
        behandlingService.save(BehandlingRequest.builder()
                .id(behandling.getId())
                .update(true)
                .relevansFor(List.of("SAK"))
                .build());

        var var = Map.of("relevans", "SAK");
        var response = graphQLTestTemplate.perform("graphqltest/behandling_filter.graphql", vars(var));

        assertThat(response, "behandling")
                .hasNoErrors()
                .hasField("totalElements", "1")
                .hasField("numberOfElements", "1")
                .hasField("content[0].id", behandling.getId());

        var innsynVar = Map.of("relevans", "INNSYN");
        GraphQLResponse pageTwo = graphQLTestTemplate.perform("graphqltest/behandling_filter.graphql", vars(innsynVar));
        assertThat(pageTwo, "behandling")
                .hasNoErrors()
                .hasField("totalElements", "0")
                .hasField("numberOfElements", "0");
    }

    @Test
    @SneakyThrows
    void behandlingSistRedigert() {
        MockFilter.setUser("A123455");

        BehandlingRequest otherBehandlingRequest = BehandlingRequest.builder()
                .id("28661fb6-29a1-42cd-87a7-661189c01920")
                .update(true)
                .relevansFor(List.of("SAK"))
                .build();
        BkatMocks.stubProcess(otherBehandlingRequest.getId(), 102);
        behandlingService.save(otherBehandlingRequest);
        behandlingService.save(BehandlingRequest.builder()
                .id(behandling.getId())
                .update(true)
                .relevansFor(List.of("SAK"))
                .build());

        var krav = storageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .underavdeling("AVD1")
                .status(KravStatus.AKTIV)
                .build());
        etterlevelseService.save(EtterlevelseRequest.builder()
                .update(false)
                .behandlingId(otherBehandlingRequest.getId())
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .build());

        MockFilter.setUser("A123456");
        var etterlevelse = etterlevelseService.save(EtterlevelseRequest.builder()
                .update(false)
                .behandlingId(behandling.getId())
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .build());

        var var = Map.of("sistRedigert", "2");
        var response = graphQLTestTemplate.perform("graphqltest/behandling_filter.graphql", vars(var));

        assertThat(response, "behandling")
                .hasNoErrors()
                .hasField("totalElements", "1")
                .hasField("numberOfElements", "1")
                .hasField("content[0].id", behandling.getId())
                .hasField("content[0].sistEndretEtterlevelse", etterlevelse.getChangeStamp().getLastModifiedDate().toString());
    }

}
