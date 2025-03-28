package no.nav.data.etterlevelse.behandlingensLivslop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.SneakyThrows;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopData;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopFil;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@FieldNameConstants
@AllArgsConstructor
public class BehandlingensLivslopRequest implements RequestElement {
    
    private UUID id;

    private String etterlevelseDokumentasjonId;

    private String beskrivelse;

    private List<MultipartFile> filer;
    
    private Boolean update;
    
    public BehandlingensLivslop convertToBehandlingensLivslop() {
        return BehandlingensLivslop.builder()
                .id(id)
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .behandlingensLivslopData(BehandlingensLivslopData.builder()
                        .beskrivelse(beskrivelse)
                        .filer(filer.stream().map(this::fileToBehandlingsLivlopFil).toList())
                        .build())
                .build();
    }

    private BehandlingensLivslopFil fileToBehandlingsLivlopFil(MultipartFile multipartFile){
            return BehandlingensLivslopFil.builder()
                    .filnavn(multipartFile.getOriginalFilename())
                    .filtype(multipartFile.getContentType())
                    .fil(getBytes(multipartFile))
                    .build();
    }

    @SneakyThrows
    private byte[] getBytes(MultipartFile f) {
        return f.getBytes();
    }

    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
    }

    public void mergeInto(BehandlingensLivslop bl) {
        bl.setEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
        bl.getBehandlingensLivslopData().setBeskrivelse(beskrivelse);
        bl.getBehandlingensLivslopData().setFiler(filer.stream().map(this::fileToBehandlingsLivlopFil).toList());
    }

}
