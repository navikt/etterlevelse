package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.behandling.dto.Behandling;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.integration.behandling.dto.BkatCode.toCode;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatProcess {

    private String id;
    private int number;
    private String name;
    private String description;
    @Singular
    private List<BkatCode> purposes;
    private BkatAffiliation affiliation;

    public Behandling convertToBehandling() {
        return Behandling.builder()
                .id(id)
                .nummer(number)
                .navn(name)
                .formaal(description)
                .overordnetFormaal(toCode(purposes.get(0)))
                .avdeling(toCode(affiliation.getDepartment()))
                .linjer(convert(affiliation.getSubDepartments(), BkatCode::toCode))
                .systemer(convert(affiliation.getProducts(), BkatCode::toCode))
                .teams(affiliation.getProductTeams())
                .build();
    }
}
