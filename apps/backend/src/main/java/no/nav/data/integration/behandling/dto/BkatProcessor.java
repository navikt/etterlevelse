package no.nav.data.integration.behandling.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatProcessor {
    private String id;
    private String name;

    public DataBehandler convertToDataBehandler() {
        return DataBehandler.builder()
                .id(id)
                .navn(name)
                .build();
    }
}
