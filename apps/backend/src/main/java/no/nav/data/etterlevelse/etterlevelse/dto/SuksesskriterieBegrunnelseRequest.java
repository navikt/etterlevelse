package no.nav.data.etterlevelse.etterlevelse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class SuksesskriterieBegrunnelseRequest implements Validated {

    private int suksesskriterieId;
    private String begrunnelse;
    private SuksesskriterieStatus suksesskriterieStatus;

    @Override
    public void format() {
        setBegrunnelse(trimToNull(begrunnelse));

        if(suksesskriterieStatus == null) {
            suksesskriterieStatus = SuksesskriterieStatus.UNDER_ARBEID;
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkBlank(Fields.begrunnelse, begrunnelse);
        if (suksesskriterieId < 0) {
            validator.addError(Fields.suksesskriterieId, "NEGATIVE_ID", "Id cannot be negative");
        }
    }
}

