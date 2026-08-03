package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatDpia {
        private String grounds;
        private Boolean needForDpia;
        private Boolean processImplemented;
        private String refToDpia;
        private String riskOwner;
        private String riskOwnerFunction;
        private List<String> noDpiaReasons;
}
