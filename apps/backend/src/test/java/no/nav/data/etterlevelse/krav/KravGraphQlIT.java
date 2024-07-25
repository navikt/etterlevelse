package no.nav.data.etterlevelse.krav;

import lombok.SneakyThrows;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.dto.KravGraphQlResponse;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.graphql.GraphQLTestBase;
import no.nav.data.integration.behandling.BkatMocks;
import no.nav.data.integration.behandling.dto.Behandling;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;


class KravGraphQlIT extends GraphQLTestBase {

    private final Behandling behandling = BkatMocks.processMockResponse().convertToBehandling();

    private EtterlevelseDokumentasjon generateEtterlevelseDok(List<String> irrelevans) {
        return etterlevelseDokumentasjonService.save(
                EtterlevelseDokumentasjonRequest.builder()
                        .title("test dokumentasjon")
                        .etterlevelseNummer(101)
                        .beskrivelse("")
                        .knyttetTilVirkemiddel(false)
                        .virkemiddelId("")
                        .forGjenbruk(false)
                        .teams(List.of(""))
                        .resources(List.of(""))
                        .irrelevansFor(irrelevans)
                        .update(false)
                        .behandlerPersonopplysninger(true)
                        .behandlingIds(List.of(behandling.getId()))
                        .prioritertKravNummer(List.of())
                        .varslingsadresser(List.of())
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

        graphQltester.documentName("kravGet")
                .variable("nummer", krav.getKravNummer())
                .variable("versjon", krav.getKravVersjon())
                .execute().path("kravById").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals( "Krav 1", kravResponse.getNavn());
                    Assertions.assertEquals( 2, kravResponse.getVarslingsadresser().size());
                    Assertions.assertEquals( "xyz", kravResponse.getVarslingsadresser().get(0).getAdresse());
                    Assertions.assertEquals( "XYZ channel", kravResponse.getVarslingsadresser().get(0).getSlackChannel().getName());
                    Assertions.assertEquals( "notfound", kravResponse.getVarslingsadresser().get(1).getAdresse());
                    Assertions.assertEquals(etterlevelseDokumentasjon.getId().toString(), kravResponse.getEtterlevelser().get(0).getEtterlevelseDokumentasjonId());
                    Assertions.assertEquals(etterlevelseDokumentasjon.getTitle(), kravResponse.getEtterlevelser().get(0).getEtterlevelseDokumentasjon().getTitle());
                });
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

            graphQltester.documentName("kravFilter")
                    .variable("relevans", List.of("SAK") )
                    .variable("nummer",  50 )
                    .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                        Assertions.assertEquals(1, kravPage.getContent().size());
                    })
                    .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav.getId().toString(), kravResponse.getId().toString());
                    });
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
        graphQltester.documentName("kravFilter")
                .variable("relevans", List.of("SAK") )
                .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                    Assertions.assertEquals(10, kravPage.getContent().size());
                });

        // size 3, 2nd page
//        assertThat(graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(Map.of("pageNumber", 1, "pageSize", 3))), "krav")
//                .hasNoErrors().hasSize("content", 3)
//                .hasField("content[0].navn", "Krav 3")
//                .hasField("content[1].navn", "Krav 4")
//                .hasField("content[2].navn", "Krav 5");
//
//        // size 3, 2nd page with filter
//        assertThat(graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(Map.of("relevans", "SAK", "pageNumber", 1, "pageSize", 3))), "krav")
//                .hasNoErrors().hasSize("content", 3)
//                .hasField("content[0].navn", "Krav 3")
//                .hasField("content[1].navn", "Krav 4")
//                .hasField("content[2].navn", "Krav 5");
    }

}
