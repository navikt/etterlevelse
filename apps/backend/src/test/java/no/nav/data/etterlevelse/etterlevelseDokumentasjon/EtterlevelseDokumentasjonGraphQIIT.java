package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.SneakyThrows;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.graphql.GraphQLTestBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static no.nav.data.graphql.GraphQLAssert.assertThat;

public class EtterlevelseDokumentasjonGraphQIIT extends GraphQLTestBase {

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
                        .behandlingIds(List.of(""))
                        .build()
        );
    }

    @BeforeEach
    void setUp() {
        MockFilter.setUser(MockFilter.KRAVEIER);
    }

    @Nested
    class EtterlevelseDokumentasjonFilter {
        @Test
        @SneakyThrows
        void statsForEtterlevelseDokOnlyRelevenatEtterlevelse() {

            EtterlevelseDokumentasjon etterlevelseDokumentasjon = generateEtterlevelseDok(List.of("INNSYN"));

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

            etterlevelseStorageService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .etterlevelseDokumentasjonId(String.valueOf(etterlevelseDokumentasjon.getId()))
                    .build());
            etterlevelseStorageService.save(Etterlevelse.builder()
                    .kravNummer(50).kravVersjon(1)
                    .build());

            var var = Map.of("etterlevelseDokumentasjonId",String.valueOf(etterlevelseDokumentasjon.getId()));
            var response = graphQLTestTemplate.perform("graphqltest/stats_for_etterlevelseDokumentasjon.graphql", vars(var));
            System.out.println(response);
            assertThat(response, "etterlevelseDokumentasjon")
                    .hasNoErrors()
                    .hasSize("content", 1)
                    .hasSize("content[0].stats.relevantKrav", 2)
                    .hasSize("content[0].stats.relevantKrav[0].etterlevelser", 1);
        }
    }
}
