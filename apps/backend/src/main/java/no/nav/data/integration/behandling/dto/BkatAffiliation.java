package no.nav.data.integration.behandling.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"department", "subDepartments", "productTeams", "products"})
public class BkatAffiliation {

    private BkatCode department;
    @Singular
    private List<BkatCode> subDepartments;
    @Singular
    private List<String> productTeams;
    @Singular
    private List<BkatCode> products;

}
