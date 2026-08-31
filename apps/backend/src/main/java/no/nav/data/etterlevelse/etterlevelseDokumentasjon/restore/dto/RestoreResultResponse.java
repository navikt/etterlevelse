package no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestoreResultResponse {

    private String etterlevelseDokumentasjonId;
    private int restoredEtterlevelser;
    private int restoredEtterlevelseMetadata;
    private int restoredBehandlingensLivslop;
    private int restoredBehandlingensArtOgOmfang;
    private int restoredPvkDokument;
    private int restoredRisikoscenario;
    private int restoredTiltak;
    private int restoredPvoTilbakemelding;

    @Builder.Default
    private List<String> warnings = new ArrayList<>();

}
