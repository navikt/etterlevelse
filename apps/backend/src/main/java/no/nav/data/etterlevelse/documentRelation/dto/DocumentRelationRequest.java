package no.nav.data.etterlevelse.documentRelation.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRelationRequest implements RequestElement {
    private String id;

    private RelationType relationType;

    private String fromDocument;

    private String toDocument;

    private JsonNode data;

    private Boolean update;

    @Override
    public void format(){
        setId(trimToNull(id));
        setFromDocument(trimToNull(fromDocument));
        setToDocument(trimToNull(toDocument));
    };

    @Override
    public void validateFieldValues(Validator<?>validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.fromDocument, fromDocument);
        validator.checkUUID(Fields.toDocument, toDocument);
    };
}
