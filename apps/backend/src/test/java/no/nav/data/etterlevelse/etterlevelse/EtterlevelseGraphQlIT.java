package no.nav.data.etterlevelse.etterlevelse;

import lombok.SneakyThrows;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.graphql.GraphQLTestBase;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

public class EtterlevelseGraphQlIT extends GraphQLTestBase {

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
                        .risikoeiere(List.of(""))
                        .irrelevansFor(irrelevans)
                        .behandlingIds(List.of())
                        .update(false)
                        .behandlerPersonopplysninger(true)
                        .prioritertKravNummer(List.of())
                        .varslingsadresser(List.of())
                        .build()
        );
    }

    @Test
    @SneakyThrows
    void getEtterlevelseWithDokumentasjonData() {

        EtterlevelseDokumentasjon etterlevelseDokumentasjon = generateEtterlevelseDok(List.of(""));

        var krav = kravStorageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .varslingsadresser(List.of(new Varslingsadresse("xyz", AdresseType.SLACK), new Varslingsadresse("notfound", AdresseType.SLACK)))
                .status(KravStatus.AKTIV)
                .build());
       var etterlevelse =  etterlevelseStorageService.save(Etterlevelse.builder()
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId().toString())
                .build());

        graphQltester.documentName("etterlevelseGet")
                .variable("id", etterlevelse.getId())
                .execute().path("etterlevelseById").entity(EtterlevelseResponse.class).satisfies(etterlevelseResponse -> {
                    Assertions.assertEquals( 50, etterlevelseResponse.getKravNummer());
                    Assertions.assertEquals( 1, etterlevelseResponse.getKravVersjon());
                    Assertions.assertEquals( etterlevelseDokumentasjon.getId().toString(), etterlevelseResponse.getEtterlevelseDokumentasjonId());
                    Assertions.assertEquals( "test dokumentasjon", etterlevelseResponse.getEtterlevelseDokumentasjon().getTitle());
                    Assertions.assertEquals( etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseResponse.getEtterlevelseDokumentasjon().getEtterlevelseNummer());

                });
    }

}
