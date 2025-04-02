package no.nav.data.etterlevelse.documentRelation.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;

import java.util.UUID;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRelationRequest implements RequestElement {

    @Builder.Default
    private UUID id = UUID.randomUUID();

    private RelationType relationType;

    private UUID fromDocument;

    private UUID toDocument;

    private JsonNode data;

    // TODO: Ser ikke ut til at update brukes noe annet sted enn i test
    private Boolean update;

    @Override
    public void format(){
    };

    @Override
    public void validateFieldValues(Validator<?>validator) {
        validator.checkNull(Fields.fromDocument, fromDocument);
        validator.checkNull(Fields.toDocument, toDocument);
    };
    
    public DocumentRelation toDocumentRelation() {
        return DocumentRelation.builder()
                .id(id)
                .relationType(relationType)
                .fromDocument(fromDocument)
                .toDocument(toDocument)
                .data(data)
                .build();
    };

}
