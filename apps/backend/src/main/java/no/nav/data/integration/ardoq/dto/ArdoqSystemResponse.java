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
public class ArdoqSystemResponse {
    private String ardoqUrlId;
    private String ardoqID;
    private String navn;
    private String alias;
    private String livsfase;
    private String beskrivelse;
}
