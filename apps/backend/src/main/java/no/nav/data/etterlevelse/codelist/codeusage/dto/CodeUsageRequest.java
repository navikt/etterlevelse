package no.nav.data.etterlevelse.codelist.codeusage.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.ListName;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class CodeUsageRequest implements Validated {

    private String listName;
    private String code;

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkRequiredEnum(Fields.listName, listName, ListName.class);
        ListName listName = getListAsListName();
        if (listName != null) {
            validator.checkRequiredCodelist(Fields.code, code, listName);
        } else {
            validator.checkBlank(Fields.code, code);
        }
    }

    @JsonIgnore
    public ListName getListAsListName() {
        try {
            return ListName.valueOf(listName);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

}
