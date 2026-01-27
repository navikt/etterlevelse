package no.nav.data.pvk.pvkdokument.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseDokumentId", "status"})
public class PvkDokumentListItemResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private UUID etterlevelseDokumentId;
    private Integer etterlevelseNummer;
    private String title;
    private PvkDokumentStatus status;
    private LocalDateTime sendtTilPvoDato;
    private String sendtTilPvoAv;
    private Integer antallInnsendingTilPvo;
    private Integer currentEtterlevelseDokumentVersjon;

    public static PvkDokumentListItemResponse buildFrom(PvkDokument pvkDokument, EtterlevelseDokumentasjon etterlevelseDokumentasjon) {
        var innsendingId = pvkDokument.getPvkDokumentData().getAntallInnsendingTilPvo();
        var latestMeldingTilPvo = pvkDokument.getPvkDokumentData()
                .getMeldingerTilPvo().stream()
                .filter(meldingTilPvo -> meldingTilPvo.getInnsendingId() == innsendingId).findFirst().orElse(null);

        return PvkDokumentListItemResponse.builder()
                .id(pvkDokument.getId())
                .etterlevelseDokumentId(pvkDokument.getEtterlevelseDokumentId())
                .title(etterlevelseDokumentasjon.getTitle())
                .etterlevelseNummer(etterlevelseDokumentasjon.getEtterlevelseNummer())
                .status(pvkDokument.getStatus())
                .currentEtterlevelseDokumentVersjon(etterlevelseDokumentasjon.getEtterlevelseDokumentasjonData() != null
                        ? etterlevelseDokumentasjon.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon()
                        : null)
                .sendtTilPvoDato(latestMeldingTilPvo != null ? latestMeldingTilPvo.getSendtTilPvoDato() : null)
                .sendtTilPvoAv(latestMeldingTilPvo != null ? latestMeldingTilPvo.getSendtTilPvoAv() : "")
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(pvkDokument.getCreatedDate() == null ? LocalDateTime.now() : pvkDokument.getCreatedDate())
                        .lastModifiedBy(pvkDokument.getLastModifiedBy())
                        .lastModifiedDate(pvkDokument.getLastModifiedDate() == null ? LocalDateTime.now() : pvkDokument.getLastModifiedDate())
                        .build())
                .antallInnsendingTilPvo(pvkDokument.getPvkDokumentData().getAntallInnsendingTilPvo())
                .build();
    }
}
