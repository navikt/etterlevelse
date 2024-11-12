package no.nav.data.etterlevelse.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.behandling.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandling.domain.BehandlingensLivslopData;
import no.nav.data.etterlevelse.behandling.domain.BehandlingensLivslopFil;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingensLivslopRequest implements RequestElement {
    
    private String id;

    private String etterlevelseDokumentasjonId;

    private String beskrivelse;

    private List<BehandlingensLivslopFil> filer;
    
    private Boolean update;
    
    public BehandlingensLivslop convertToBehandlingensLivslop() {
        return BehandlingensLivslop.builder()
                .id(id != null && !id.isEmpty() ? UUID.fromString(id) : null)
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .behandlingensLivslopData(BehandlingensLivslopData.builder()
                        .beskrivelse(beskrivelse)
                        .filer(filer)
                        .build())
                .build();
    }

    public void validateFieldValues(Validator<?> validator) {
        // FIXME
    }

    public Boolean getUpdate() {
        return update;
    }

    public void mergeInto(BehandlingensLivslop bl) {
        bl.setEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
        bl.getBehandlingensLivslopData().setBeskrivelse(beskrivelse);
        bl.getBehandlingensLivslopData().setFiler(filer);
    }

}
