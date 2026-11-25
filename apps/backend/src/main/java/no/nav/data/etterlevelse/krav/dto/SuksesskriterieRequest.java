package no.nav.data.etterlevelse.krav.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;
import no.nav.data.etterlevelse.krav.domain.SuksesskriteriumFlyt;

import java.util.List;

import static org.apache.commons.lang3.StringUtils.trimToNull;


@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class SuksesskriterieRequest implements Validated {

    private int id;
    private String navn;
    private String beskrivelse;
    private boolean behovForBegrunnelse;
    private List<SuksesskriterieStatus> deaktiverteSuksesskriterieStatus;
    private SuksesskriteriumFlyt oppyltStatusFlyt;
    private Integer hopperOverTilSuksesskriterieIndexForOppyfltFlyt;
    private SuksesskriteriumFlyt ikkeOppyltStatusFlyt;
    private Integer hopperOverTilSuksesskriterieIndexForIkkeOppyltFlyt;
    private SuksesskriteriumFlyt ikkeRelevantStatusFlyt;
    private Integer hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt;

    @Override
    public void format() {
        setNavn(trimToNull(navn));
        setBeskrivelse(trimToNull(beskrivelse));
        setBehovForBegrunnelse(behovForBegrunnelse);
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkBlank(Fields.navn, navn);
        if (id < 0) {
            validator.addError(Fields.id, "NEGATIVE_ID", "Id cannot be negative");
        }
    }
}
