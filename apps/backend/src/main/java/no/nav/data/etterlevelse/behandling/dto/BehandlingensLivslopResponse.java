package no.nav.data.etterlevelse.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.behandling.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandling.domain.BehandlingensLivslopFil;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingensLivslopResponse {
    
    private UUID id;

    private String etterlevelseDokumentasjonId;

    private String beskrivelse;

    private List<BehandlingensLivslopFil> filer;
    
    public static BehandlingensLivslopResponse buildFrom(BehandlingensLivslop bl) {
        return builder()
                .id(bl.getId())
                .etterlevelseDokumentasjonId(bl.getEtterlevelseDokumentasjonId())
                .beskrivelse(bl.getBehandlingensLivslopData().getBeskrivelse())
                .filer(bl.getBehandlingensLivslopData().getFiler())
                .build();
    }
    
}
