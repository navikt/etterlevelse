package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.SneakyThrows;
import no.nav.data.TestConfig;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonGraphQlResponse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravData;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.graphql.GraphQLTestBase;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

public class EtterlevelseDokumentasjonGraphQIIT extends GraphQLTestBase {

    @BeforeEach
    void setUp() {
        TestConfig.MockFilter.setUser(TestConfig.MockFilter.KRAVEIER);
    }

    @Test
    @SneakyThrows
    void statsForEtterlevelseDokOnlyRelevenatKrav() {

        EtterlevelseDokumentasjon eDok1 = createEtterlevelseDokumentasjon();
        EtterlevelseDokumentasjon eDok2 = createEtterlevelseDokumentasjon();

        createKrav("Krav 1", 50);
        createKrav("Krav 2", 51);

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
        createKrav("Krav 1", 50);

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
    
    private Krav createKrav(String navn, int nummer) {
        return kravService.save(Krav.builder().id(UUID.randomUUID()).kravNummer(nummer).kravVersjon(1)
                .data(KravData.builder().navn(navn).status(KravStatus.AKTIV).relevansFor(List.of("SAK")).build())
                .build());
    }
}
