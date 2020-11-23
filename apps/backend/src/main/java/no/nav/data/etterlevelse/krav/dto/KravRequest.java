package no.nav.data.etterlevelse.krav.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KravRequest implements RequestElement {

    private String id;
    // TODO

    private Boolean update;

    @Override
    public void format() {

    }

    @Override
    public void validateFieldValues(Validator<?> validator) {

    }
}
