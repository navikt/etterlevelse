package no.nav.data.etterlevelse.krav;

import lombok.SneakyThrows;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.dto.KravGraphQlResponse;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.graphql.GraphQLTestBase;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;


class KravGraphQlIT extends GraphQLTestBase {

    @BeforeEach
    void setUp() {
        MockFilter.setUser(MockFilter.KRAVEIER);
    }

    @Test
    @SneakyThrows
    void getKrav() {

        EtterlevelseDokumentasjon etterlevelseDokumentasjon = createEtterlevelseDokumentasjon();

        var krav = kravStorageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .varslingsadresser(List.of(new Varslingsadresse("xyz", AdresseType.SLACK), new Varslingsadresse("notfound", AdresseType.SLACK)))
                .status(KravStatus.AKTIV)
                .build());
        etterlevelseService.save(Etterlevelse.builder()
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId())
                .build());

        graphQltester.documentName("kravGet")
                .variable("nummer", krav.getKravNummer())
                .variable("versjon", krav.getKravVersjon())
                .execute().path("kravById").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals( "Krav 1", kravResponse.getNavn());
                    Assertions.assertEquals( 2, kravResponse.getVarslingsadresserQl().size());
                    Assertions.assertEquals( "xyz", kravResponse.getVarslingsadresserQl().get(0).getAdresse());
                    Assertions.assertEquals( "XYZ channel", kravResponse.getVarslingsadresserQl().get(0).getSlackChannel().getName());
                    Assertions.assertEquals( "notfound", kravResponse.getVarslingsadresserQl().get(1).getAdresse());
                    Assertions.assertEquals(etterlevelseDokumentasjon.getId().toString(), kravResponse.getEtterlevelser().get(0).getEtterlevelseDokumentasjonId().toString());
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
        @Test
        @SneakyThrows
        void kravForUnderavdeling() {
            var krav = kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .underavdeling("AVD1")
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .underavdeling("AVD2")
                    .build());

            graphQltester.documentName("kravFilter")
                    .variable("underavdeling", "AVD1")
                    .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                        Assertions.assertEquals(1, kravPage.getContent().size());
                    })
                    .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav.getId().toString(), kravResponse.getId().toString());
                    });
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

            graphQltester.documentName("kravFilter")
                    .variable("lov", "ARKIV")
                    .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                        Assertions.assertEquals(1, kravPage.getContent().size());
                    })
                    .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav.getId().toString(), kravResponse.getId().toString());
                    });
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

            graphQltester.documentName("kravFilter")
                    .variable("lover", List.of("ARKIV", "ANNET"))
                    .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                        Assertions.assertEquals(1, kravPage.getContent().size());
                    })
                    .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav.getId().toString(), kravResponse.getId().toString());
                    });
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

            graphQltester.documentName("kravFilter")
                    .variable("gjeldendeKrav", true)
                    .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                        Assertions.assertEquals(1, kravPage.getContent().size());
                    })
                    .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav.getId().toString(), kravResponse.getId().toString());
                    });

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
        graphQltester.documentName("kravFilter")
                .variable("pageNumber", 1)
                .variable("pageSize", 3)
                .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                    Assertions.assertEquals(3, kravPage.getContent().size());
                })
                .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals("Krav 3", kravResponse.getNavn());
                })
                .path("krav.content[1]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals("Krav 4", kravResponse.getNavn());
                })
                .path("krav.content[2]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals("Krav 5", kravResponse.getNavn());
                });

        // size 3, 2nd page with filter
        graphQltester.documentName("kravFilter")
                .variable("pageNumber", 1)
                .variable("pageSize", 3)
                .variable("relevans", List.of("SAK"))
                .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                    Assertions.assertEquals(3, kravPage.getContent().size());
                })
                .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals("Krav 3", kravResponse.getNavn());
                })
                .path("krav.content[1]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals("Krav 4", kravResponse.getNavn());
                })
                .path("krav.content[2]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals("Krav 5", kravResponse.getNavn());
                });
    }

        @Test
        @SneakyThrows
        void kravForEtterlevelseDokumentasjon() {
            List<String> EtterlevelseDokumentasjonRelevans = List.of("SAK");

            EtterlevelseDokumentasjon etterlevelseDokumentasjon = createEtterlevelseDokumentasjon();
            etterlevelseDokumentasjon.getEtterlevelseDokumentasjonData().setIrrelevansFor(List.of("INNSYN"));
            etterlevelseDokumentasjonRepo.save(etterlevelseDokumentasjon);
            

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

            etterlevelseService.save(Etterlevelse.builder()
                    .kravNummer(51).kravVersjon(1)
                    .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId())
                    .build());

            graphQltester.documentName("kravFilter")
                    .variable("etterlevelseDokumentasjonId", String.valueOf(etterlevelseDokumentasjon.getId()))
                    .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                        Assertions.assertEquals(3, kravPage.getContent().size());
                    })
                    .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav50RelevansMatch.getId().toString(), kravResponse.getId().toString());
                    })
                    .path("krav.content[1]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav51MedEtterlevelse.getId().toString(), kravResponse.getId().toString());
                    })
                    .path("krav.content[2]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav51NyesteVersjon.getId().toString(), kravResponse.getId().toString());
                    });
        }

        @Test
        @SneakyThrows
        void kravForEtterlevelseDokumentasjonNoIrrelevans() {

            EtterlevelseDokumentasjon etterlevelseDokumentasjon = createEtterlevelseDokumentasjon();


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
            etterlevelseService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId())
                    .build());

            graphQltester.documentName("kravFilter")
                    .variable("etterlevelseDokumentasjonId", String.valueOf(etterlevelseDokumentasjon.getId()))
                    .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                        Assertions.assertEquals(2, kravPage.getContent().size());
                    })
                    .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav.getId().toString(), kravResponse.getId().toString());
                    })
                    .path("krav.content[1]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(krav2.getId().toString(), kravResponse.getId().toString());
                    });

        }

        @Test
        @SneakyThrows
        void kravForEtterlevelseDokOnlyRelevenatEtterlevelse() {

            EtterlevelseDokumentasjon eDok1 = createEtterlevelseDokumentasjon();
            EtterlevelseDokumentasjon eDok2 = createEtterlevelseDokumentasjon();

            kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .relevansFor(List.of("SAK"))
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(eDok1.getId())
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .etterlevelseDokumentasjonId(eDok2.getId())
                    .kravNummer(50).kravVersjon(1)
                    .build());


            graphQltester.documentName("kravForEtterlevelseDokumentasjon")
                    .variable("etterlevelseDokumentasjonId", String.valueOf(eDok1.getId()))
                    .execute().path("krav").entity(RestResponsePage.class).satisfies(kravPage -> {
                        Assertions.assertEquals(1, kravPage.getContent().size());
                    })
                    .path("krav.content[0]").entity(KravGraphQlResponse.class).satisfies(kravResponse -> {
                        Assertions.assertEquals(1, kravResponse.getEtterlevelser().size());
                    });

        }
    }
}
