package no.nav.data.pvk.risikoscenario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

import java.util.List;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class KravRisikoscenarioRequest {
    private Integer kravnummer;
    private List<String> risikoscenarioIder;
}
