package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatDataProcessing {
    private Boolean dataProcessor;
    @Singular
    private List<String> processors;

    public DataProsessering convertToDataProsessering() {
        return DataProsessering.builder()
                .benyttesDataBehandlere(dataProcessor)
                .dataBehandlerIds(processors)
                .build();
    }
}
