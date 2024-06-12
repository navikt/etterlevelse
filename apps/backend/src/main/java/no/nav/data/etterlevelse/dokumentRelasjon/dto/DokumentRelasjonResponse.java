package no.nav.data.etterlevelse.dokumentRelasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.dokumentRelasjon.domain.RelationType;

import java.util.UUID;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "from", "to", "relationType"})
public class DokumentRelasjonResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private RelationType relationType;
    private String from;
    private String to;
}
