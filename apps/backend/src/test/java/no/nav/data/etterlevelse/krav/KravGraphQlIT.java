package no.nav.data.etterlevelse.krav;

import lombok.SneakyThrows;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.graphql.GraphQLTestBase;
import no.nav.data.integration.behandling.BkatMocks;
import no.nav.data.integration.behandling.dto.Behandling;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static no.nav.data.graphql.GraphQLAssert.assertThat;


class KravGraphQlIT extends GraphQLTestBase {

    private final Behandling behandling = BkatMocks.processMockResponse().convertToBehandling();

    private EtterlevelseDokumentasjon generateEtterlevelseDok(List<String> irrelevans) {
        return etterlevelseDokumentasjonService.save(
                EtterlevelseDokumentasjonRequest.builder()
                        .title("test dokumentasjon")
                        .etterlevelseNummer(101)
                        .knyttetTilVirkemiddel(false)
                        .virkemiddelId("")
                        .knytteTilTeam(false)
                        .teams(List.of(""))
                        .irrelevansFor(irrelevans)
                        .update(false)
                        .behandlerPersonopplysninger(true)
                        .behandlingIds(List.of(behandling.getId()))
                        .build()
        );
    }

    @BeforeEach
    void setUp() {
        MockFilter.setUser(MockFilter.KRAVEIER);
    }

    @Test
    @SneakyThrows
    void getKrav() {

        EtterlevelseDokumentasjon etterlevelseDokumentasjon = generateEtterlevelseDok(List.of(""));

        var krav = kravStorageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .varslingsadresser(List.of(new Varslingsadresse("xyz", AdresseType.SLACK), new Varslingsadresse("notfound", AdresseType.SLACK)))
                .status(KravStatus.AKTIV)
                .build());
        etterlevelseStorageService.save(Etterlevelse.builder()
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId().toString())
                .build());

        var var = Map.of("nummer", krav.getKravNummer(), "versjon", krav.getKravVersjon());
        var response = graphQLTestTemplate.perform("graphqltest/krav_get.graphql", vars(var));

        assertThat(response, "kravById")
                .hasNoErrors()
                .hasField("navn", "Krav 1")
                .hasSize("varslingsadresser", 2)
                .hasField("varslingsadresser[0].adresse", "xyz")
                .hasField("varslingsadresser[0].slackChannel.name", "XYZ channel")
                .hasField("varslingsadresser[1].adresse", "notfound")
                .hasField("etterlevelser[0].etterlevelseDokumentasjonId", etterlevelseDokumentasjon.getId().toString())
                .hasField("etterlevelser[0].etterlevelseDokumentasjon.title", etterlevelseDokumentasjon.getTitle());
    }

    @Nested
    class KravFilter {

        @Test
        @SneakyThrows
        void kravFilter() {
            var krav = kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .relevansFor(List.of("SAK"))
                    .status(KravStatus.AKTIV)
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .relevansFor(List.of("INNSYN"))
                    .status(KravStatus.AKTIV)
                    .build());

            var var = Map.of("relevans", "SAK", "nummer", 50);
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize("content", 1)
                    .hasField("content[0].id", krav.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravForEtterlevelseDokumentasjon() {
            List<String> EtterlevelseDokumentasjonRelevans = List.of("SAK");

            EtterlevelseDokumentasjon etterlevelseDokumentasjon = generateEtterlevelseDok(List.of("INNSYN"));

            kravStorageService.save(Krav.builder()
                    .navn("gammel versjon av krav 50").kravNummer(50).kravVersjon(1)
                    .relevansFor(EtterlevelseDokumentasjonRelevans)
                    .status(KravStatus.AKTIV)
                    .build());

            var krav50RelevansMatch = kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(2)
                    .relevansFor(EtterlevelseDokumentasjonRelevans)
                    .status(KravStatus.AKTIV)
                    .build());
            var krav51MedEtterlevelse = kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .relevansFor(List.of("INNSYN"))
                    .status(KravStatus.AKTIV)
                    .build());
            var krav51NyesteVersjon = kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(2)
                    .relevansFor(List.of("INNSYN", "SAK"))
                    .status(KravStatus.AKTIV)
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("Irrelevant").kravNummer(52).kravVersjon(1)
                    .relevansFor(List.of("INNSYN"))
                    .status(KravStatus.AKTIV)
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("UTKAST").kravNummer(53).kravVersjon(1)
                    .status(KravStatus.UTKAST)
                    .relevansFor(EtterlevelseDokumentasjonRelevans)
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("UTGÅTT").kravNummer(54).kravVersjon(1)
                    .status(KravStatus.UTGAATT)
                    .relevansFor(EtterlevelseDokumentasjonRelevans)
                    .build());

            etterlevelseStorageService.save(Etterlevelse.builder()
                    .kravNummer(51).kravVersjon(1)
                    .etterlevelseDokumentasjonId(String.valueOf(etterlevelseDokumentasjon.getId()))
                    .build());

            var var = Map.of("etterlevelseDokumentasjonId", etterlevelseDokumentasjon.getId());
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize("content", 3)
                    .hasField("content[0].id", krav50RelevansMatch.getId().toString())
                    .hasField("content[1].id", krav51MedEtterlevelse.getId().toString())
                    .hasField("content[2].id", krav51NyesteVersjon.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravForEtterlevelseDokumentasjonNoIrrelevans() {

            EtterlevelseDokumentasjon etterlevelseDokumentasjon = generateEtterlevelseDok(List.of(""));


            var krav = kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .relevansFor(List.of("SAK"))
                    .status(KravStatus.AKTIV)
                    .build());
            var krav2 = kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .relevansFor(List.of("INNSYN"))
                    .status(KravStatus.AKTIV)
                    .build());
            etterlevelseStorageService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(String.valueOf(etterlevelseDokumentasjon.getId()))
                    .build());

            var var = Map.of("etterlevelseDokumentasjonId", String.valueOf(etterlevelseDokumentasjon.getId()));
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize("content", 2)
                    .hasField("content[0].id", krav.getId().toString())
                    .hasField("content[1].id", krav2.getId().toString());

        }

        @Test
        @SneakyThrows
        void kravForUnderleverandor() {
            var krav = kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .underavdeling("AVD1")
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .underavdeling("AVD2")
                    .build());

            var var = Map.of("underavdeling", "AVD1");
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize("content", 1)
                    .hasField("content[0].id", krav.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravForLov() {
            var krav = kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .regelverk(List.of(Regelverk.builder().lov("ARKIV").build()))
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .regelverk(List.of(Regelverk.builder().lov("PERSON").build()))
                    .build());

            var var = Map.of("lov", "ARKIV");
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize("content", 1)
                    .hasField("content[0].id", krav.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravForLover() {
            var krav = kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .regelverk(List.of(Regelverk.builder().lov("ARKIV").build()))
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .regelverk(List.of(Regelverk.builder().lov("PERSON").build()))
                    .build());

            var var = Map.of("lover", List.of("ARKIV", "ANNET"));
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize("content", 1)
                    .hasField("content[0].id", krav.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravGjeldende() {
            var krav = kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .underavdeling("AVD1")
                    .status(KravStatus.AKTIV)
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .underavdeling("AVD2")
                    .status(KravStatus.UTGAATT)
                    .build());

            var var = Map.of("gjeldendeKrav", true);
            var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize("content", 1)
                    .hasField("content[0].id", krav.getId().toString());
        }

        @Test
        @SneakyThrows
        void kravForEtterlevelseDokOnlyRelevenatEtterlevelse() {

            EtterlevelseDokumentasjon etterlevelseDokumentasjon = generateEtterlevelseDok(List.of("INNSYN"));

            kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .relevansFor(List.of("SAK"))
                    .build());
            etterlevelseStorageService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(String.valueOf(etterlevelseDokumentasjon.getId()))
                    .build());
            etterlevelseStorageService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .build());

            var var = Map.of("etterlevelseDokumentasjonId",String.valueOf(etterlevelseDokumentasjon.getId()));
            var response = graphQLTestTemplate.perform("graphqltest/krav_for_etterlevelseDokumentasjon.graphql", vars(var));

            assertThat(response, "krav")
                    .hasNoErrors()
                    .hasSize("content", 1)
                    .hasSize("content[0].etterlevelser", 1);
        }
    }

    @Test
    @SneakyThrows
    void kravPaged() {
        for (int i = 0; i < 10; i++) {
            kravStorageService.save(Krav.builder()
                    .navn("Krav " + i).kravNummer(50 + i).kravVersjon(1)
                    .relevansFor(List.of("SAK"))
                    .build());
        }

        // all
        assertThat(graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(Map.of("relevans", "SAK"))), "krav")
                .hasNoErrors().hasSize("content", 10);

        // size 3, 2nd page
        assertThat(graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(Map.of("pageNumber", 1, "pageSize", 3))), "krav")
                .hasNoErrors().hasSize("content", 3)
                .hasField("content[0].navn", "Krav 3")
                .hasField("content[1].navn", "Krav 4")
                .hasField("content[2].navn", "Krav 5");

        // size 3, 2nd page with filter
        assertThat(graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(Map.of("relevans", "SAK", "pageNumber", 1, "pageSize", 3))), "krav")
                .hasNoErrors().hasSize("content", 3)
                .hasField("content[0].navn", "Krav 3")
                .hasField("content[1].navn", "Krav 4")
                .hasField("content[2].navn", "Krav 5");
    }

}
