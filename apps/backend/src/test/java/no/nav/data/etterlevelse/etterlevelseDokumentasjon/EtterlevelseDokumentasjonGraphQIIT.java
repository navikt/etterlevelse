package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.SneakyThrows;
import no.nav.data.TestConfig;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonGraphQlResponse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.graphql.GraphQLTestBase;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

public class EtterlevelseDokumentasjonGraphQIIT extends GraphQLTestBase {

    @BeforeEach
    void setUp() {
        TestConfig.MockFilter.setUser(TestConfig.MockFilter.KRAVEIER);
    }

    @Nested
    class EtterlevelseDokumentasjonFilter {

        @Test
        @SneakyThrows
        void statsForEtterlevelseDokOnlyRelevenatKrav() {

            EtterlevelseDokumentasjon eDok1 = createEtterlevelseDokumentasjon();
            EtterlevelseDokumentasjon eDok2 = createEtterlevelseDokumentasjon();

            kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .status(KravStatus.AKTIV)
                    .relevansFor(List.of("SAK"))
                    .build());
            kravStorageService.save(Krav.builder()
                    .navn("Krav 2").kravNummer(51).kravVersjon(1)
                    .status(KravStatus.AKTIV)
                    .relevansFor(List.of("SAK"))
                    .build());

            etterlevelseService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(eDok1.getId())
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(eDok2.getId())
                    .build());

            graphQltester.documentName("statsForEtterlevelseDokumentasjon")
                    .variable("etterlevelseDokumentasjonId", String.valueOf(eDok1.getId()))
                    .execute().path("etterlevelseDokumentasjon").entity(RestResponsePage.class)
                    .satisfies(page -> {
                        Assertions.assertEquals( 1, page.getContent().size());
                    })
                    .path("etterlevelseDokumentasjon.content[0]").entity(EtterlevelseDokumentasjonGraphQlResponse.class)
                    .satisfies(etterlevelseDokumentasjonResponse -> {
                        Assertions.assertEquals(2, etterlevelseDokumentasjonResponse.getStats().getRelevantKrav().size());
                    });
        }

        @Test
        @SneakyThrows
        void statsForEtterlevelseDokOnlyRelevenatEtterlevelser() {

            EtterlevelseDokumentasjon eDok1 = createEtterlevelseDokumentasjon();
            EtterlevelseDokumentasjon eDok2 = createEtterlevelseDokumentasjon();

            kravStorageService.save(Krav.builder()
                    .navn("Krav 1").kravNummer(50).kravVersjon(1)
                    .status(KravStatus.AKTIV)
                    .relevansFor(List.of("SAK"))
                    .build());

            etterlevelseService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(eDok1.getId())
                    .build());
            etterlevelseService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(eDok2.getId())
                    .build());

            graphQltester.documentName("statsForEtterlevelseDokumentasjon")
                    .variable("etterlevelseDokumentasjonId", String.valueOf(eDok1.getId()))
                    .execute().path("etterlevelseDokumentasjon").entity(RestResponsePage.class).satisfies(page -> {
                        Assertions.assertEquals( 1, page.getContent().size());
                    })
                    .path("etterlevelseDokumentasjon.content[0]").entity(EtterlevelseDokumentasjonGraphQlResponse.class).satisfies(etterlevelseDokumentasjonResponse -> {
                        Assertions.assertEquals(1, etterlevelseDokumentasjonResponse.getStats().getRelevantKrav().size());
                        Assertions.assertEquals(1, etterlevelseDokumentasjonResponse.getStats().getRelevantKrav().get(0).getEtterlevelser().size());
                    });

        }
    }
}
