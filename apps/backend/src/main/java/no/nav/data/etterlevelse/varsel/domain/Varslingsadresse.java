package no.nav.data.etterlevelse.varsel.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.varsel.dto.VarslingsadresseGraphQlResponse;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class Varslingsadresse implements Validated {

    private String adresse;
    private AdresseType type;


    @Override
    public void format() {
        setAdresse(trimToNull(adresse));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkNull(Fields.type, type);
        validator.checkNull(Fields.adresse, adresse);
        if (type == AdresseType.EPOST) {
            validator.checkEmail(Fields.adresse, adresse);
        }
    }

    public VarslingsadresseGraphQlResponse toGraphQlResponse() {
        return VarslingsadresseGraphQlResponse.builder()
                .adresse(adresse)
                .type(type)
                .build();
    }
}
