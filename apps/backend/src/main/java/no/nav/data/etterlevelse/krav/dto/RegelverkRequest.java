package no.nav.data.etterlevelse.krav.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.ListName;

import static no.nav.data.common.utils.StringUtils.toUpperCaseAndTrim;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class RegelverkRequest implements Validated {

    // Codelist LOV
    private String lov;
    private String spesifisering;

    @Override
    public void format() {
        setLov(toUpperCaseAndTrim(lov));
        setSpesifisering(trimToNull(spesifisering));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkRequiredCodelist(Fields.lov, lov, ListName.LOV);
    }
}
