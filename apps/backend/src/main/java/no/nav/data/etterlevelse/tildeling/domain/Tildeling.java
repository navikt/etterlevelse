package no.nav.data.etterlevelse.tildeling.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.tildeling.dto.TildelingRequest;
import no.nav.data.etterlevelse.tildeling.dto.TildelingResponse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tildeling implements DomainObject, KravId {
    private UUID id;
    private Integer version;
    private ChangeStamp changeStamp;
    private Integer kravVersjon;
    private Integer kravNummer;
    private String behandlingId;
    private List<String> tildeltMed;
    private String notater;

    public Tildeling convert(TildelingRequest request) {
        kravNummer = request.getKravNummer();
        kravVersjon = request.getKravVersjon();
        behandlingId = request.getBehandlingId();
        tildeltMed = copyOf(request.getTildeltMed());
        notater = request.getNotater();
        return this;
    }

    public TildelingResponse toResponse(){
        return TildelingResponse.builder()
                .id(id)
                .version(version)
                .changeStamp(convertChangeStampResponse())
                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)
                .behandlingId(behandlingId)
                .tildeltMed(copyOf(tildeltMed))
                .notater(notater)
                .build();
    }

}
