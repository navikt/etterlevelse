package no.nav.data.pvk.pvkdokument.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseDokumentId", "status"})
public class PvkDokumentListItemResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private UUID etterlevelseDokumentId;
    private Integer etterlevelseNummer;
    private String title;
    private PvkDokumentStatus status;
    private LocalDateTime sendtTilPvoDato;
    private String sendtTilPvoAv;
    private Integer antallInnsendingTilPvo;
}
