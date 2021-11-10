package no.nav.data.etterlevelse.kravprioritering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.KravId;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class KravPrioriteringRequest implements RequestElement, KravId {

    private String id;

    private Integer kravNummer;
    private Integer kravVersjon;

    private String prioriteringsId;

    @Override
    public void format() {
        setId(trimToNull(id));
        setPrioriteringsId(trimToNull(prioriteringsId));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkId(this);
        validator.checkNull(Fields.kravNummer, kravNummer);
        validator.checkNull(Fields.kravVersjon,kravVersjon);
    }
}
