package no.nav.data.pvk.tiltak.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class RisikoscenarioTiltakRequest {
    private UUID risikoscenarioId;
    private List<UUID> tiltakIds;
}
