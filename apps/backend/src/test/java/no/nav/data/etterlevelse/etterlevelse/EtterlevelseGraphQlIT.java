package no.nav.data.etterlevelse.etterlevelse;

import lombok.SneakyThrows;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.graphql.GraphQLTestBase;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

public class EtterlevelseGraphQlIT extends GraphQLTestBase {

    @Test
    @SneakyThrows
    void getEtterlevelseWithDokumentasjonData() {

        EtterlevelseDokumentasjon etterlevelseDokumentasjon = createEtterlevelseDokumentasjon();

        var krav = kravStorageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .varslingsadresser(List.of(new Varslingsadresse("xyz", AdresseType.SLACK), new Varslingsadresse("notfound", AdresseType.SLACK)))
                .status(KravStatus.AKTIV)
                .build());
       var etterlevelse = etterlevelseService.save(Etterlevelse.builder()
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId())
                .build());

        graphQltester.documentName("etterlevelseGet")
                .variable("id", etterlevelse.getId())
                .execute().path("etterlevelseById").entity(EtterlevelseResponse.class).satisfies(etterlevelseResponse -> {
                    Assertions.assertEquals( 50, etterlevelseResponse.getKravNummer());
                    Assertions.assertEquals( 1, etterlevelseResponse.getKravVersjon());
                    Assertions.assertEquals( etterlevelseDokumentasjon.getId(), etterlevelseResponse.getEtterlevelseDokumentasjonId());
                    Assertions.assertEquals( "test dokumentasjon", etterlevelseResponse.getEtterlevelseDokumentasjon().getTitle());
                    Assertions.assertEquals( etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseResponse.getEtterlevelseDokumentasjon().getEtterlevelseNummer());

        });
    }

}
