package no.nav.data.etterlevelse.codelist.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import org.apache.commons.lang3.StringUtils;

import static no.nav.data.common.utils.StringUtils.toUpperCaseAndTrim;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class CodelistRequest implements RequestElement {

    private String list;
    private String code;
    private String shortName;
    private String description;
    private JsonNode data;

    public Codelist convert() {
        return Codelist.builder()
                .list(ListName.valueOf(list))
                .code(code)
                .shortName(shortName)
                .description(description)
                .data(data)
                .build();
    }

    private Boolean update;

    @JsonIgnore
    @Override
    public String getId() {
        return list + "-" + code;
    }

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
        setCode(toUpperCaseAndTrim(code));
        setShortName(StringUtils.trim(shortName));
        setDescription(StringUtils.trim(description));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkRequiredEnum(Fields.list, getList(), ListName.class);
        if (!update) {
            Validator.checkIfCodelistIsOfImmutableType(getList());
        }
        validator.checkCodelistCode(Fields.code, getCode());
        validator.checkBlank(Fields.shortName, getShortName());
        validator.checkBlank(Fields.description, getDescription());
    }

}
