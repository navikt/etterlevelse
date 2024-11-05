package no.nav.data.etterlevelse.etterlevelse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieBegrunnelse;
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

    private boolean veiledning;
    private String veiledningsTekst;
    private String veiledningsTekst2;

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
    
    public SuksesskriterieBegrunnelse convertTo() {
        return SuksesskriterieBegrunnelse.builder()
                .suksesskriterieId(suksesskriterieId)
                .begrunnelse(begrunnelse)
                .suksesskriterieStatus(suksesskriterieStatus)
                .veiledning(veiledning)
                .veiledningsTekst(veiledningsTekst)
                .veiledningsTekst2(veiledningsTekst2)
                .build();
    }

}

