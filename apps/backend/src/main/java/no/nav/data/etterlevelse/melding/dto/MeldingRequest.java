package no.nav.data.etterlevelse.melding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.melding.domain.AlertType;
import no.nav.data.etterlevelse.melding.domain.MeldingStatus;
import no.nav.data.etterlevelse.melding.domain.MeldingType;

import static org.apache.commons.lang3.StringUtils.trimToNull;
@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class MeldingRequest implements RequestElement {
    private String id;
    private ChangeStamp changeStamp;
    private String melding;
    private String secondaryTittel;
    private String secondaryMelding;
    private MeldingType meldingType;
    private MeldingStatus meldingStatus;
    private AlertType alertType;
    private Boolean update;
    private Integer version;


    @Override
    public void format() {
        setId(trimToNull(id));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(MeldingRequest.Fields.id,id);
        validator.checkId(this);
        validator.checkNull(Fields.melding, melding);
        validator.checkNull(Fields.meldingType, meldingType);
        validator.checkNull(Fields.meldingStatus, meldingStatus);
        validator.checkNull(Fields.alertType, alertType);
    }

}
