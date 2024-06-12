package no.nav.data.etterlevelse.dokumentRelasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.dokumentRelasjon.domain.RelationType;

import java.util.UUID;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = "data")
@JsonPropertyOrder({"id", "from", "to", "relationType"})
public class DocumentRelationResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private RelationType relationType;
    private String from;
    private String to;
    private JsonNode data;
}
