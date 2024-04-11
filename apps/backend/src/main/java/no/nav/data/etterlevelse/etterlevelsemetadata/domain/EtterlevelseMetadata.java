package no.nav.data.etterlevelse.etterlevelsemetadata.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataResponse;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseMetadata extends DomainObject implements KravId {

    private Integer kravVersjon;
    private Integer kravNummer;
    private String behandlingId;
    private String etterlevelseDokumentasjonId;
    private List<String> tildeltMed;
    private String notater;

    // Updates all fields from the request except id, version and changestamp
    // TODO: behandlingId blir IKKE merget. Er dette riktig? Hvis ja: oppdater kommentaren over. Hvis nei: fiks
    // Se https://trello.com/c/lJlryZIG/357-felter-blir-ignorert-ved-konvertering-av-request
    public EtterlevelseMetadata merge(EtterlevelseMetadataRequest request) {
        kravNummer = request.getKravNummer();
        kravVersjon = request.getKravVersjon();
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
