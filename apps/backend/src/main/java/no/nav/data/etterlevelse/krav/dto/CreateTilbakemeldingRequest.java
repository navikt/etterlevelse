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
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding.TilbakemeldingsType;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingStatus;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class CreateTilbakemeldingRequest implements Validated, KravId {

    private Integer kravNummer;
    private Integer kravVersjon;

    private String tittel;
    private TilbakemeldingsType type;
    private Varslingsadresse varslingsadresse;

    private String foersteMelding;

    private TilbakemeldingStatus status;

    private boolean endretKrav;
    @JsonIgnore
    private String ident;

    @Override
    public void format() {
        setTittel(trimToNull(getTittel()));
        setFoersteMelding(trimToNull(getFoersteMelding()));
        setIdent(SecurityUtils.getCurrentIdent());
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkNull(Fields.kravNummer, kravNummer);
        validator.checkNull(Fields.kravVersjon, kravVersjon);

        validator.checkNull(Fields.type, type);
        validator.checkNull(Fields.varslingsadresse, varslingsadresse);
        if (varslingsadresse != null) {
            validator.validateType(Fields.varslingsadresse, varslingsadresse);
        }
        validator.checkBlank(Fields.foersteMelding, foersteMelding);
    }
}
