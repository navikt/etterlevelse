package no.nav.data.pvk.tiltak.dto;

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
public class RisikoscenarioTiltakRequest {
    private String risikoscenarioId;
    private List<String> tiltakIds;
}
