package no.nav.data.etterlevelse.arkivering.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "behandlingId", "etterlevelseDokumentasjonId", "webSakNummer", "arkiveringDato", "status"})
public class EtterlevelseArkivResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private String etterlevelseDokumentasjonId;
    private String behandlingId;
    private String status;
    private LocalDateTime arkiveringDato;
    private String arkivertAv;
    private LocalDateTime tilArkiveringDato;
    private LocalDateTime arkiveringAvbruttDato;
    private String webSakNummer;
    private boolean onlyActiveKrav;
}
