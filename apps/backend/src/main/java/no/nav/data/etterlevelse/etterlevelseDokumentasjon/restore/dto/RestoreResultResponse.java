package no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore.dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private List<String> warnings = new ArrayList<>();

    public List<String> getWarnings() {
        return Collections.unmodifiableList(new ArrayList<>(warnings));
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings == null ? new ArrayList<>() : new ArrayList<>(warnings);
    }

}
