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

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRelationRequest implements RequestElement<UUID> {

    private UUID id;

    private RelationType relationType;

    private String fromDocument;

    private String toDocument;

    private JsonNode data;

    // TODO: Ser ikke ut til at update brukes noe annet sted enn i test
    private Boolean update;

    @Override
    public void format(){
        setFromDocument(trimToNull(fromDocument));
        setToDocument(trimToNull(toDocument));
    };

    @Override
    public void validateFieldValues(Validator<?>validator) {
        validator.checkUUID(Fields.fromDocument, fromDocument);
        validator.checkUUID(Fields.toDocument, toDocument);
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
