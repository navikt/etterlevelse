package no.nav.data.etterlevelse.etterlevelse.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse.EtterlevelseStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "behandling", "kravNummer", "kravVersjon", "etterleves", "begrunnelse", "dokumentasjon", "fristForFerdigstillelse", "status"})
public class EtterlevelseResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private String behandling;
    private Integer kravNummer;
    private Integer kravVersjon;

    private boolean etterleves;
    private String begrunnelse;
    private List<String> dokumentasjon;
    private LocalDate fristForFerdigstillelse;
    private EtterlevelseStatus status;

}
