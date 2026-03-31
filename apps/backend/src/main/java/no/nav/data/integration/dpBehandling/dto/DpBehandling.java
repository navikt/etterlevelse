package no.nav.data.integration.dpBehandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DpBehandling {

    private String id;
    private String navn;
    private int nummer;
}
