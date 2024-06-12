package no.nav.data.etterlevelse.documentRelation.domain;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationRequest;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationResponse;
import org.hibernate.annotations.Type;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "DOCUMENT_RELATION")
public class DocumentRelation extends Auditable {

    @Id
    @Column(name = "ID")
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "RELATION_TYPE", nullable = false)
    private RelationType relationType;

    @Column(name = "FROM_DOCUMENT", nullable = false)
    private String fromDocument;

    @Column(name = "TO_DOCUMENT", nullable = false)
    private String toDocument;

    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA")
    private JsonNode data;

    public DocumentRelation merge(DocumentRelationRequest request){
        relationType = request.getRelationType();
        fromDocument = request.getFromDocument();
        toDocument = request.getToDocument();
        data = request.getData();
        return this;
    };

    public DocumentRelationResponse toResponse() {
        return DocumentRelationResponse.builder()
                .id(id)
                .relationType(relationType)
                .fromDocument(fromDocument)
                .toDocument(toDocument)
                .data(data)
                .build();
    };
}
