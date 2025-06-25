package no.nav.data.integration.nom.dto;

import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.integration.nom.domain.OrgEnhet;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class OrgEnhetGraphqlResponse {
    private DataWrapper data;
    private ArrayNode errors;

    @Data
    public static class DataWrapper {

        OrgEnhet orgEnhet;

    }
}
