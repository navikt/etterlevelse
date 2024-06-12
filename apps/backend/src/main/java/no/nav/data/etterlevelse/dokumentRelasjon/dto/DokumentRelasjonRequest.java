package no.nav.data.etterlevelse.dokumentRelasjon.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.dokumentRelasjon.domain.RelationType;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class DokumentRelasjonRequest implements RequestElement {
    private String id;

    private RelationType relationType;

    private String from;

    private String to;

    private JsonNode data;

    private Boolean update;

    @Override
    public void format(){
        setId(trimToNull(id));
        setFrom(trimToNull(from));
        setTo(trimToNull(to));
    };

    @Override
    public void validateFieldValues(Validator<?>validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.from, from);
        validator.checkUUID(Fields.to, to);
    };
}
