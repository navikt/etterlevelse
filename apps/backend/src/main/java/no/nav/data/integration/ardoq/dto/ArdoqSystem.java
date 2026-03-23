package no.nav.data.integration.ardoq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqSystem {
    private String Ardoq_OID;
    private String Ardoq_ID;
    private String Name;
    private String Alias;
    private String Lifecycle_Phase;
    private String Description;
}
