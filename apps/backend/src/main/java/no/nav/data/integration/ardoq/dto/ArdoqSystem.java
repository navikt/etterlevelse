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
    private String Ardoq_OID;
    @JsonProperty("Ardoq ID")
    private String Ardoq_ID;
    @JsonProperty("Name")
    private String Name;
    @JsonProperty("Alias")
    private String Alias;
    @JsonProperty("Lifecycle Phase")
    private String Lifecycle_Phase;
    @JsonProperty("Description")
    private String Description;
}
