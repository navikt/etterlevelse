package no.nav.data.etterlevelse.behandling.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingensLivslopData {

    private String beskrivelse;

    @Builder.Default
    private List<BehandlingensLivslopFil> filer = new ArrayList<>();
    
}
