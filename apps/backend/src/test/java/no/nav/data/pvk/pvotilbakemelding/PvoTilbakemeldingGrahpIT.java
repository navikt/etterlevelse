package no.nav.data.pvk.pvotilbakemelding;

import lombok.SneakyThrows;
import no.nav.data.TestConfig;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.graphql.GraphQLTestBase;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentData;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingData;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.Vurdering;
import no.nav.data.pvk.pvotilbakemelding.dto.PvoTilbakemeldingGraphqlResponse;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

public class PvoTilbakemeldingGrahpIT extends GraphQLTestBase {

    @BeforeEach
    void setUp() {
        TestConfig.MockFilter.setUser(TestConfig.MockFilter.PVO);
    }

    @Test
    @SneakyThrows
    void etterlevelseDokumentasjonDataInPvoTilbakemeldingGraphQl() {
        
        EtterlevelseDokumentasjon eDok1 = createEtterlevelseDokumentasjon();
        PvkDokument pvkDokument = pvkDokumentRepo.save(PvkDokument.builder()
                .etterlevelseDokumentId(eDok1.getId())
                .status(PvkDokumentStatus.SENDT_TIL_PVO)
                .pvkDokumentData(PvkDokumentData.builder()
                        .merknadTilPvoEllerRisikoeier("test")
                        .build())
                .build());

        PvoTilbakemelding pvoTilbakemelding = pvoTilbakemeldingRepo.save(PvoTilbakemelding.builder()
                .pvkDokumentId(pvkDokument.getId())
                .status(PvoTilbakemeldingStatus.UNDERARBEID)
                .pvoTilbakemeldingData(PvoTilbakemeldingData.builder()
                        .vurderinger(List.of(Vurdering.builder()
                                        .innsendingId(1)
                                .merknadTilEtterleverEllerRisikoeier("test melding til etterlever")
                                .build()))
                        .build())
                .build());

        graphQltester.documentName("pvoTilbakemeldingMedEtterlevelseDokumentasjonData")
        .variable("$pvoTilbakemeldingId", String.valueOf(pvoTilbakemelding.getId()))
        .execute().path("pvoTilbakemelding").entity(RestResponsePage.class).satisfies(page -> {
            Assertions.assertEquals(1, page.getContent().size());
        })
        .path("pvoTilbakemelding.content[0]").entity(PvoTilbakemeldingGraphqlResponse.class).satisfies(pvoTilbakemeldingGraphqlResponse -> {
            Assertions.assertEquals(PvoTilbakemeldingStatus.UNDERARBEID, pvoTilbakemeldingGraphqlResponse.getStatus());
            Assertions.assertEquals(pvkDokument.getId().toString(), pvoTilbakemeldingGraphqlResponse.getPvkDokumentId());
            Assertions.assertEquals(eDok1.getId().toString(), pvoTilbakemeldingGraphqlResponse.getEtterlevelseDokumentasjonId());
            Assertions.assertEquals(PvkDokumentStatus.SENDT_TIL_PVO, pvoTilbakemeldingGraphqlResponse.getPvkDokumentStatus());
            Assertions.assertEquals(eDok1.getEtterlevelseNummer(), pvoTilbakemeldingGraphqlResponse.getEtterlevelseDokumentasjonData().getEtterlevelseNummer());
            Assertions.assertEquals(eDok1.getTitle(), pvoTilbakemeldingGraphqlResponse.getEtterlevelseDokumentasjonData().getTitle());
        });

    }
}
