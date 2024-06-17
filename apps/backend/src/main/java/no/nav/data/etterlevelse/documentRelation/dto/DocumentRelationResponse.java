package no.nav.data.etterlevelse.documentRelation.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;

import java.util.UUID;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = "data")
@JsonPropertyOrder({"id", "fromDocument", "toDocument", "relationType"})
public class DocumentRelationResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private RelationType relationType;
    private String fromDocument;
    private String toDocument;
    private JsonNode data;
}
