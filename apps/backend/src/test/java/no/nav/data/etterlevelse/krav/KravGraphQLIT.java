package no.nav.data.etterlevelse.krav;

import com.graphql.spring.boot.test.GraphQLResponse;
import lombok.SneakyThrows;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.behandling.dto.BehandlingRequest;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.graphql.GraphQLTestBase;
import no.nav.data.integration.behandling.BkatMocks;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static no.nav.data.graphql.GraphQLAssert.assertThat;


class KravGraphQLIT extends GraphQLTestBase {

    private final Behandling behandling = BkatMocks.processMockResponse().convertToBehandling();

    @BeforeEach
    void setUp() {
        MockFilter.setUser(MockFilter.KRAVEIER);
    }

    @Test
    @SneakyThrows
    void getKrav() {
        var krav = storageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .varslingsadresser(List.of(new Varslingsadresse("xyz", AdresseType.SLACK), new Varslingsadresse("notfound", AdresseType.SLACK)))
                .build());
        storageService.save(Etterlevelse.builder()
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .behandlingId(behandling.getId())
                .build());

        var var = Map.of("nummer", krav.getKravNummer().toString(), "versjon", krav.getKravVersjon().toString());
        var response = graphQLTestTemplate.perform("graphqltest/krav_get.graphql", vars(var));

        assertThat(response, "kravById")
                .hasNoErrors()
                .hasField("navn", "Krav 1")
                .hasSize("varslingsadresser", 2)
                .hasField("varslingsadresser[0].adresse", "xyz")
                .hasField("varslingsadresser[0].slackChannel.name", "XYZ channel")
                .hasField("varslingsadresser[1].adresse", "notfound")
                .hasField("etterlevelser[0].behandlingId", behandling.getId())
                .hasField("etterlevelser[0].behandling.navn", behandling.getNavn());
    }

    @Nested
    class KravFilter {

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
        void kravForBehandling() {
            List<String> behandlingRelevans = List.of("SAK");

            behandlingService.save(BehandlingRequest.builder()
                    .id(behandling.getId())
                    .update(true)
                    .relevansFor(behandlingRelevans)
                    .build());

            storageService.save(Krav.builder()
                    .navn("gammel versjon av krav 50").kravNummer(50).kravVersjon(1)
                    .relevansFor(behandlingRelevans)
                    .build());
            var krav50RelevansMatch = storageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(2)
                    .relevansFor(behandlingRelevans)
                    .build());
            var krav51MedEtterlevelse = storageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .relevansFor(List.of("INNSYN"))
                    .build());
            var krav51NyesteVersjon = storageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(2)
                    .relevansFor(List.of("INNSYN", "SAK"))
                    .build());
            storageService.save(Krav.builder()
                    .navn("Irrelevant").kravNummer(52).kravVersjon(1)
                    .relevansFor(List.of("INNSYN"))
                    .build());
            storageService.save(Krav.builder()
                    .navn("UTKAST").kravNummer(53).kravVersjon(1)
                    .status(KravStatus.UTKAST)
                    .relevansFor(behandlingRelevans)
                    .build());
            storageService.save(Krav.builder()
                    .navn("UTGÅTT").kravNummer(54).kravVersjon(1)
                    .status(KravStatus.UTGAATT)
                    .relevansFor(behandlingRelevans)
                    .build());

            storageService.save(Etterlevelse.builder()
                    .kravNummer(51).kravVersjon(1)
                    .behandlingId(behandling.getId())
                    .build());

            var var = Map.of("behandlingId", behandling.getId());
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize(3)
                    .hasField("[0].id", krav50RelevansMatch.getId().toString())
                    .hasField("[1].id", krav51MedEtterlevelse.getId().toString())
                    .hasField("[2].id", krav51NyesteVersjon.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravForBehandlingNoRelevans() {
            var krav = storageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .relevansFor(List.of("SAK"))
                    .build());
            storageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .relevansFor(List.of("INNSYN"))
                    .build());
            storageService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .behandlingId(behandling.getId())
                    .build());

            var var = Map.of("behandlingId", behandling.getId());
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize(1)
                    .hasField("[0].id", krav.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravForUnderleverandor() {
            var krav = storageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .underavdeling("AVD1")
                    .build());
            storageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .underavdeling("AVD2")
                    .build());

            var var = Map.of("underavdeling", "AVD1");
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize(1)
                    .hasField("[0].id", krav.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravForBehandlingOnlyRelevenatEtterlevelse() {
            storageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .relevansFor(List.of("SAK"))
                    .build());
            storageService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .behandlingId(behandling.getId())
                    .build());
            storageService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .build());

            var var = Map.of("behandlingId", behandling.getId());
            var response = graphQLTestTemplate.perform("graphqltest/krav_for_behandling.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize(1)
                    .hasSize("[0].etterlevelser", 1);
        }
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

    @Nested
    class BehandlingQuery {

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
    }
}
