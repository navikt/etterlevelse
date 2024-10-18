package no.nav.data.integration.behandling.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatInformationTypeShort {
    private String id;
    private String name;
    private BkatCode sensitivity;
}
