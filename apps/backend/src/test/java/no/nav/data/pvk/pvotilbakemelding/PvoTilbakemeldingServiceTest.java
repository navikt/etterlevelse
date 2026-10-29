package no.nav.data.pvk.pvotilbakemelding;

import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PvoTilbakemeldingServiceTest {

    @Test
    void fromAuditData_convertsLegacySnapshotToSingleVurdering() {
        String legacy = """
                {
                  "id": "c8229bca-28a1-4a8b-9503-e7848727efe4",
                  "pvkDokumentId": "1cc8f281-c38f-4585-8d28-054c72758bd7",
                  "status": "FERDIG",
                  "pvoTilbakemeldingData": {
                    "behandlingenslivslop": {"tilbakemeldingTilEtterlevere": "Livslop feedback"},
                    "behandlingensArtOgOmfang": {"tilbakemeldingTilEtterlevere": "Art og omfang feedback"},
                    "merknadTilEtterleverEllerRisikoeier": "Merknad",
                    "sendtDato": "2025-06-20T13:24:33"
                  }
                }
                """;

        PvoTilbakemelding result = PvoTilbakemeldingService.fromAuditData(legacy);

        assertThat(result.getStatus()).isEqualTo(PvoTilbakemeldingStatus.FERDIG);
        var vurderinger = result.getPvoTilbakemeldingData().getVurderinger();
        assertThat(vurderinger).hasSize(1);
        var vurdering = vurderinger.getFirst();
        assertThat(vurdering.getInnsendingId()).isEqualTo(1);
        assertThat(vurdering.getEtterlevelseDokumentVersjon()).isEqualTo(1);
        assertThat(vurdering.getBehandlingenslivslop().getTilbakemeldingTilEtterlevere()).isEqualTo("Livslop feedback");
        assertThat(vurdering.getBehandlingensArtOgOmfang().getTilbakemeldingTilEtterlevere()).isEqualTo("Art og omfang feedback");
        assertThat(vurdering.getMerknadTilEtterleverEllerRisikoeier()).isEqualTo("Merknad");
    }

    @Test
    void fromAuditData_keepsLegacyInnsendingId() {
        String legacy = """
                {
                  "status": "FERDIG",
                  "pvoTilbakemeldingData": {
                    "innsendingId": 2,
                    "behandlingenslivslop": {"tilbakemeldingTilEtterlevere": "Andre innsending"}
                  }
                }
                """;

        var vurdering = PvoTilbakemeldingService.fromAuditData(legacy).getPvoTilbakemeldingData().getVurderinger().getFirst();

        assertThat(vurdering.getInnsendingId()).isEqualTo(2);
        assertThat(vurdering.getEtterlevelseDokumentVersjon()).isEqualTo(1);
    }

    @Test
    void fromAuditData_leavesCurrentShapeUnchanged() {
        String current = """
                {
                  "status": "FERDIG",
                  "pvoTilbakemeldingData": {
                    "vurderinger": [
                      {"innsendingId": 1, "etterlevelseDokumentVersjon": 1},
                      {"innsendingId": 1, "etterlevelseDokumentVersjon": 2}
                    ]
                  }
                }
                """;

        var vurderinger = PvoTilbakemeldingService.fromAuditData(current).getPvoTilbakemeldingData().getVurderinger();

        assertThat(vurderinger).hasSize(2);
        assertThat(vurderinger.get(1).getEtterlevelseDokumentVersjon()).isEqualTo(2);
    }
}
