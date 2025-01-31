package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;

import java.util.ArrayList;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.integration.behandling.dto.BkatCode.toCode;

/**
 * Bruker operasjon i Polly som svarer med "ProcessShortResponse", ikke hele Process objektet,
 * om flere felter trengs må det oppdateres eller bruke en annen operasjon
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatProcess {

    private String id;
    private int number;
    private String name;
    private String description;
    private Boolean automaticProcessing;
    private Boolean profiling;
    @Singular
    private List<BkatCode> purposes;
    private BkatAffiliation affiliation;
    @Singular
    private List<BkatPolicy> policies;
    private BkatDataProcessing dataProcessing;

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
                .policies(policies != null && !policies.isEmpty() ? policies.stream().map(BkatPolicy::convertToPolyResponse).toList(): new ArrayList<>())
                .automatiskBehandling(automaticProcessing)
                .profilering(profiling)
                .dataBehandlerList(List.of())
                .build();
    }
}
