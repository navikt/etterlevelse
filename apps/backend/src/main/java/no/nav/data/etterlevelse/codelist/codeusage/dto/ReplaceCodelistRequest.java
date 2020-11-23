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

import static no.nav.data.common.utils.StringUtils.toUpperCaseAndTrim;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class ReplaceCodelistRequest implements Validated {

    private String list;
    private String oldCode;
    private String newCode;

    @JsonIgnore
    public ListName getListAsListName() {
        try {
            return ListName.valueOf(list);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Override
    public void format() {
        setList(toUpperCaseAndTrim(list));
        setOldCode(toUpperCaseAndTrim(oldCode));
        setNewCode(toUpperCaseAndTrim(newCode));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkRequiredEnum(Fields.list, getList(), ListName.class);
        ListName listName = getListAsListName();
        if (listName != null) {
            validator.checkRequiredCodelist(Fields.oldCode, getOldCode(), listName);
            validator.checkRequiredCodelist(Fields.newCode, getNewCode(), listName);
        }
    }

}
