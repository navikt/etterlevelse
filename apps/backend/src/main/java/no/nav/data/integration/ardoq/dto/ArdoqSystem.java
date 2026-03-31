package no.nav.data.integration.ardoq.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqSystem {
    @JsonProperty("Ardoq OID")
    private String ardoqOID;
    @JsonProperty("Ardoq ID")
    private String ardoqID;
    @JsonProperty("Name")
    private String name;
    @JsonProperty("Alias")
    private String alias;
    @JsonProperty("Lifecycle Phase")
    private String lifecyclePhase;
    @JsonProperty("Description")
    private String description;
}
