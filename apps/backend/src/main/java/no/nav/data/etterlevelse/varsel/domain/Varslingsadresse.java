package no.nav.data.etterlevelse.varsel.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.integration.slack.dto.SlackDtos.Channel;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class Varslingsadresse implements Validated {

    private String adresse;
    private AdresseType type;

    public Varslingsadresse(String adresse, AdresseType type) {
        this.adresse = adresse;
        this.type = type;
    }

    // GraphQL
    @JsonIgnore
    private Channel slackChannel;

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
}
