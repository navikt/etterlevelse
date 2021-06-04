package no.nav.data.etterlevelse.etterlevelse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class SuksesskriterieBegrunnelseRequest implements Validated {

    private int id;
    private String begrunnelse;

    @Override
    public void format() {
        setBegrunnelse(trimToNull(begrunnelse));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkBlank(Fields.begrunnelse, begrunnelse);
        if (id < 0) {
            validator.addError(Fields.id, "NEGATIVE_ID", "Id cannot be negative");
        }
    }
}

