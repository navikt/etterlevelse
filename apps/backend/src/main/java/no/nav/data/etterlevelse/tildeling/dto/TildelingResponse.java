package no.nav.data.etterlevelse.tildeling.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "kravNummer", "kravVersion", "behandlingId", "tildeltMed"})
public class TildelingResponse {
    private UUID id;
    private Integer version;
    private Integer kravNummer;
    private Integer kravVersjon;
    private String behandlingId;
    private List<String> tildeltMed;
    private ChangeStampResponse changeStamp;
}
