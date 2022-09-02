package no.nav.data.etterlevelse.arkivering.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "behandlingId", "webSakNummer", "arkiveringDato", "status"})
public class EtterlevelseArkivResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private String behandlingId;
    private EtterlevelseArkivStatus status;
    private LocalDateTime arkiveringDato;
    private String webSakNummer;
}
