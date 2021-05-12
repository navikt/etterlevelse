package no.nav.data.etterlevelse.krav.dto;

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
public class EditTilbakemeldingRequest implements Validated {

    private String innhold;

    @Override
    public void format() {
        setInnhold(trimToNull(innhold));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkNull(Fields.innhold, innhold);
    }
}
