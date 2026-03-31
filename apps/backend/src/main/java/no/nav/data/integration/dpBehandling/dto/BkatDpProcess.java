package no.nav.data.integration.dpBehandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatDpProcess {
    private String id;
    private String name;
    private int dpProcessNumber;


    public DpBehandling convertToDpBehandling() {
        return DpBehandling.builder()
                .id(id)
                .nummer(dpProcessNumber)
                .navn(name)
                .build();
    }
}
