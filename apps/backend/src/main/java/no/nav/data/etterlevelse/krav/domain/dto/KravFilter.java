package no.nav.data.etterlevelse.krav.domain.dto;

import graphql.execution.ExecutionStepInfo;
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
    private Integer sistRedigert;

    public List<String> getRelevans() {
        return formatList(relevans);
    }

    public boolean isEmpty() {
        validate();
        return getRelevans().isEmpty()
                && nummer == null
                && behandlingId == null
                && underavdeling == null
                && lov == null
                && !gjeldendeKrav
                && sistRedigert == null
                ;
    }

    private void validate() {
        if (sistRedigert != null) {
            if (sistRedigert < 1) {
                sistRedigert = null;
            } else if (sistRedigert > 20) {
                sistRedigert = 20;
            }
        }
    }

    public static <T> T get(DataFetchingEnvironment env, String field) {
        Map<String, T> vars = getFilter(env.getExecutionStepInfo());
        return vars.get(field);
    }

    private static <T> T getFilter(ExecutionStepInfo executionStepInfo) {
        var step = executionStepInfo;
        while (step.hasParent() && step.getArgument("filter") == null) {
            step = step.getParent();
        }
        return step.getArgument("filter");
    }

}
