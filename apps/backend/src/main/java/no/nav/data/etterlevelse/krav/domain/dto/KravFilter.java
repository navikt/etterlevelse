package no.nav.data.etterlevelse.krav.domain.dto;

import graphql.schema.DataFetchingEnvironment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

import java.util.List;
import java.util.Map;

import static no.nav.data.common.utils.StringUtils.formatList;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldNameConstants
public class KravFilter {

    private List<String> relevans;
    private Integer nummer;
    private String behandlingId;
    private String underavdeling;
    private String lov;
    private boolean gjeldendeKrav;

    public List<String> getRelevans() {
        return formatList(relevans);
    }

    public boolean isEmpty() {
        return getRelevans().isEmpty()
                && nummer == null
                && behandlingId == null
                && underavdeling == null
                && lov == null
                && !gjeldendeKrav
                ;
    }

    public static <T> T get(DataFetchingEnvironment env, String field) {
        Map<String, T> vars = env.getExecutionStepInfo().getParent().getArgument("filter");
        return vars.get(field);
    }

}
