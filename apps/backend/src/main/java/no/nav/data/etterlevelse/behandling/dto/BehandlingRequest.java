package no.nav.data.etterlevelse.behandling.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.ListName;

import java.util.List;

import static no.nav.data.common.utils.StringUtils.formatListToUppercase;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingRequest implements RequestElement {

    private String id;
    private Boolean update;

    @Schema(description = "Codelist RELEVANS")
    private List<String> irrelevansFor;

    @Override
    public void format() {
        setIrrelevansFor(formatListToUppercase(irrelevansFor));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkId(this);
        validator.checkCodelists(Fields.irrelevansFor, irrelevansFor, ListName.RELEVANS);
    }
}
