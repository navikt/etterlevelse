package no.nav.data.etterlevelse.documentRelation.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;

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

    private EtterlevelseDokumentasjonResponse fromDocumentWithData;
    private EtterlevelseDokumentasjonResponse toDocumentWithData;
    
    public static DocumentRelationResponse buildFrom(DocumentRelation dr) {
        return DocumentRelationResponse.builder()
                .id(dr.getId())
                .version(dr.getVersion())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(dr.getCreatedDate())
                        .lastModifiedBy(dr.getLastModifiedBy())
                        .lastModifiedDate(dr.getLastModifiedDate())
                        .build())
                .relationType(dr.getRelationType())
                .fromDocument(dr.getFromDocument())
                .toDocument(dr.getToDocument())
                .data(dr.getData())
                .build();
    };

}
