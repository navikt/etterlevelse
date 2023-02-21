package no.nav.data.etterlevelse.krav.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding.Rolle;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingStatus;

import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class TilbakemeldingNewMeldingRequest implements Validated {

    private UUID tilbakemeldingId;
    private String melding;
    private Rolle rolle;
    private TilbakemeldingStatus status;
    private boolean endretKrav;
    @JsonIgnore
    private String ident;

    @Override
    public void format() {
        setMelding(trimToNull(getMelding()));
        setIdent(SecurityUtils.getCurrentIdent());
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkNull(Fields.tilbakemeldingId, tilbakemeldingId);
        validator.checkNull(Fields.rolle, rolle);
        validator.checkBlank(Fields.melding, melding);
        if (rolle == Rolle.KRAVEIER && !SecurityUtils.isKravEier()) {
            validator.addError(Fields.rolle, "IKKE_KRAVEIER", "Kan ikke opprette svar som kraveier");
        }
    }
}
