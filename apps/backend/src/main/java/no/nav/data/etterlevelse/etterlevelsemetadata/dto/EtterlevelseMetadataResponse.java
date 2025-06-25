package no.nav.data.etterlevelse.etterlevelsemetadata.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "kravNummer", "kravVersjon", "tildeltMed"})
public class EtterlevelseMetadataResponse {
    private UUID id;
    private Integer version;
    private Integer kravNummer;
    private Integer kravVersjon;
    private UUID etterlevelseDokumentasjonId;
    private List<String> tildeltMed;
    private ChangeStampResponse changeStamp;
    private String notater;
    
    public static EtterlevelseMetadataResponse buildFrom(EtterlevelseMetadata emd) {
        return EtterlevelseMetadataResponse.builder()
                .id(emd.getId())
                .version(emd.getVersion())
                .changeStamp(emd.convertChangeStampResponse())
                .kravNummer(emd.getKravNummer())
                .kravVersjon(emd.getKravVersjon())
                .etterlevelseDokumentasjonId(emd.getEtterlevelseDokumentasjonId())
                .tildeltMed(copyOf(emd.getTildeltMed()))
                .notater(emd.getNotater())
                .build();
    }

}
