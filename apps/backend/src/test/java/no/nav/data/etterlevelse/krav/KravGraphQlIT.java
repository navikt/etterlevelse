package no.nav.data.etterlevelse.krav;

import lombok.SneakyThrows;
import no.nav.data.TestConfig.MockFilter;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.graphql.GraphQLTestBase;
import no.nav.data.integration.behandling.BkatMocks;
import no.nav.data.integration.behandling.dto.Behandling;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
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
                .execute().path("kravById").entity(KravResponse.class).satisfies(kravResponse -> {
                    Assertions.assertEquals( "Krav 1", kravResponse.getNavn());
                    Assertions.assertEquals( 2, kravResponse.getVarslingsadresser().size());
                });

/*        assertThat(response, "kravById")
                .hasNoErrors()
                .hasField("navn", "Krav 1")
                .hasSize("varslingsadresser", 2)
                .hasField("varslingsadresser[0].adresse", "xyz")
                .hasField("varslingsadresser[0].slackChannel.name", "XYZ channel")
                .hasField("varslingsadresser[1].adresse", "notfound")
                .hasField("etterlevelser[0].etterlevelseDokumentasjonId", etterlevelseDokumentasjon.getId().toString())
                .hasField("etterlevelser[0].etterlevelseDokumentasjon.title", etterlevelseDokumentasjon.getTitle());*/
    }

}
