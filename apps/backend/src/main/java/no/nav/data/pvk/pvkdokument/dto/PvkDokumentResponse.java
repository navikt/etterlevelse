package no.nav.data.pvk.pvkdokument.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.pvk.pvkdokument.domain.MeldingTilPvo;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.domain.PvkVurdering;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseDokumentId", "status"})
public class PvkDokumentResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private UUID etterlevelseDokumentId;
    private PvkDokumentStatus status;

    private List<CodelistResponse> ytterligereEgenskaper;

    private PvkVurdering pvkVurdering;
    private String pvkVurderingsBegrunnelse;
    private Boolean berOmNyVurderingFraPvo;

    private Boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private Boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

    private String merknadTilRisikoeier;
    private String merknadFraRisikoeier;

    private Integer antallInnsendingTilPvo;

    private List<MeldingTilPvo> meldingerTilPvo;

    private LocalDateTime godkjentAvRisikoeierDato;
    private String godkjentAvRisikoeier;

    private Integer currentEtterlevelseDokumentVersjon;

    public static PvkDokumentResponse buildFrom(PvkDokument pvkDokument) {
        return PvkDokumentResponse.builder()
                .id(pvkDokument.getId())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(pvkDokument.getCreatedDate() == null ? LocalDateTime.now() : pvkDokument.getCreatedDate())
                        .lastModifiedBy(pvkDokument.getLastModifiedBy())
                        .lastModifiedDate(pvkDokument.getLastModifiedDate() == null ? LocalDateTime.now() : pvkDokument.getLastModifiedDate())
                        .build())
                .version(pvkDokument.getVersion())
                .etterlevelseDokumentId(pvkDokument.getEtterlevelseDokumentId())
                .status(pvkDokument.getStatus())

                .ytterligereEgenskaper(pvkDokument.getPvkDokumentData().ytterligereEgenskaperAsCodes())
                .pvkVurdering(pvkDokument.getPvkDokumentData().getPvkVurdering())
                .pvkVurderingsBegrunnelse(pvkDokument.getPvkDokumentData().getPvkVurderingsBegrunnelse())
                .berOmNyVurderingFraPvo(pvkDokument.getPvkDokumentData().getBerOmNyVurderingFraPvo())

                .harInvolvertRepresentant(pvkDokument.getPvkDokumentData().getHarInvolvertRepresentant())
                .representantInvolveringsBeskrivelse(pvkDokument.getPvkDokumentData().getRepresentantInvolveringsBeskrivelse())
                .harDatabehandlerRepresentantInvolvering(pvkDokument.getPvkDokumentData().getHarDatabehandlerRepresentantInvolvering())
                .dataBehandlerRepresentantInvolveringBeskrivelse(pvkDokument.getPvkDokumentData().getDataBehandlerRepresentantInvolveringBeskrivelse())
                .merknadTilRisikoeier(pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier())
                .merknadFraRisikoeier(pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier())
                .godkjentAvRisikoeierDato(pvkDokument.getPvkDokumentData().getGodkjentAvRisikoeierDato())
                .godkjentAvRisikoeier(pvkDokument.getPvkDokumentData().getGodkjentAvRisikoeier())
                .antallInnsendingTilPvo(pvkDokument.getPvkDokumentData().getAntallInnsendingTilPvo())
                .meldingerTilPvo(copyOf(pvkDokument.getPvkDokumentData().getMeldingerTilPvo()))
                .build();
    }

}
