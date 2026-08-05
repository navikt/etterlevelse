package no.nav.data.pvk.pvkdokument.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.domain.PvkVurdering;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({ "etterlevelseDokumentasjonId", "status"})
public class PvkDokumentShortResponse {
    private UUID etterlevelseDokumentasjonId;
    private Integer etterlevelseNummer;
    private String title;
    private Integer etterlevelseDokumentVersjon;

    private UUID pvkDokumentId;
    private PvkVurdering pvkVurdering;
    private PvkDokumentStatus status;
    private List<CodelistResponse> ytterligereEgenskaper;
    private boolean hasPvkDocumentationStarted;
}
