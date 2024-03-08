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
import static no.nav.data.etterlevelse.graphql.support.GraphQlResolverUtil.getFilter;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldNameConstants
public class KravFilter {

    // any of
    private List<String> relevans;
    private Integer nummer;

    private String etterlevelseDokumentasjonId;
    private boolean etterlevelseDokumentasjonIrrevantKrav;
    private String underavdeling;
    private String lov;
    private String tema;
    private List<String> status;
    // any of
    private List<String> lover;
    private boolean gjeldendeKrav;
    private Integer sistRedigert;
    private String virkemiddelId;

    public List<String> getRelevans() {
        return formatList(relevans);
    }

    public List<String> getLover() {
        return formatList(lover);
    }

    public List<String> getStatus() {
        return formatList(status);
    }

    public boolean isEmpty() {
        validate();
        return getRelevans().isEmpty()
                && nummer == null
                && etterlevelseDokumentasjonId == null
                && underavdeling == null
                && lov == null
                && tema == null
                && getStatus().isEmpty()
                && getLover().isEmpty()
                && !gjeldendeKrav
                && sistRedigert == null
                && !etterlevelseDokumentasjonIrrevantKrav
                && virkemiddelId == null
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

}
