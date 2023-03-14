package no.nav.data.etterlevelse.etterlevelsemetadata.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataResponse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseMetadata implements DomainObject, KravId {
    private UUID id;
    private Integer version;
    private ChangeStamp changeStamp;
    private Integer kravVersjon;
    private Integer kravNummer;
    private String behandlingId;
    private String etterlevelseDokumentasjonId;
    private List<String> tildeltMed;
    private String notater;

    public EtterlevelseMetadata convert(EtterlevelseMetadataRequest request) {
        kravNummer = request.getKravNummer();
        kravVersjon = request.getKravVersjon();
        behandlingId = request.getBehandlingId();
        etterlevelseDokumentasjonId = request.getEtterlevelseDokumentasjonId();
        tildeltMed = copyOf(request.getTildeltMed());
        notater = request.getNotater();
        return this;
    }

    public EtterlevelseMetadataResponse toResponse(){
        return EtterlevelseMetadataResponse.builder()
                .id(id)
                .version(version)
                .changeStamp(convertChangeStampResponse())
                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)
                .behandlingId(behandlingId)
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .tildeltMed(copyOf(tildeltMed))
                .notater(notater)
                .build();
    }

}
