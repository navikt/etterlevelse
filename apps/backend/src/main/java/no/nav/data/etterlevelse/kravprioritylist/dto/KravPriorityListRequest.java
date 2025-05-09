package no.nav.data.etterlevelse.kravprioritylist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.ListName;

import java.util.List;
import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class KravPriorityListRequest implements RequestElement {

    private UUID id;

    private String temaId;
    private List<Integer> priorityList;

    private Boolean update;

    @Override
    public void format() {
        setTemaId(trimToNull(temaId));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkNull(Fields.temaId, temaId);
        validator.checkCodelist(Fields.temaId, temaId, ListName.TEMA);
    }
}
