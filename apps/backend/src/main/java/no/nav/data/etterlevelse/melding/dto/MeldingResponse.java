package no.nav.data.etterlevelse.melding.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.melding.domain.AlertType;
import no.nav.data.etterlevelse.melding.domain.MeldingStatus;
import no.nav.data.etterlevelse.melding.domain.MeldingType;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "melding","secondaryTittel", "secondaryMelding" ,"meldingType", "meldingStatus"})
public class MeldingResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private String melding;
    private String secondaryTittel;
    private String secondaryMelding;
    private MeldingType meldingType;
    private MeldingStatus meldingStatus;
    private AlertType alertType;
    private Integer version;

}
