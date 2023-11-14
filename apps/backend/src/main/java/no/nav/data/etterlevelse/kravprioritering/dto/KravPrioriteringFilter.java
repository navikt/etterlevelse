package no.nav.data.etterlevelse.kravprioritering.dto;

import graphql.schema.DataFetchingEnvironment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import org.apache.commons.lang3.StringUtils;

import java.util.Map;

import static no.nav.data.etterlevelse.graphql.support.GraphQlResolverUtil.getFilter;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldNameConstants
public class KravPrioriteringFilter {

    private String id;
    private Integer kravNummer;
    private String temaCode;
    private String kravStatus;

    public boolean isEmpty() {
        return  StringUtils.isBlank(id)
                && kravNummer == null
                && kravStatus == null
                && temaCode == null
                ;
    }

    public static <T> T get(DataFetchingEnvironment env, String field) {
        Map<String, T> vars = getFilter(env.getExecutionStepInfo());
        return vars.get(field);
    }
}