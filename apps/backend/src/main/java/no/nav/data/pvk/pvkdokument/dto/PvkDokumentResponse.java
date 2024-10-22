package no.nav.data.pvk.pvkdokument.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.pvk.pvkdokument.domain.OpplysningtypeData;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentFil;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.domain.YtterligereEgenskaper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static java.util.List.copyOf;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseDokumentId", "status"})
public class PvkDokumentResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private String etterlevelseDokumentId;
    private PvkDokumentStatus status;

    private List<YtterligereEgenskaper> ytterligereEgenskaper;
    private boolean skalUtforePvk;
    private String pvkVurderingsBegrunnelse;
    private boolean stemmerOpplysningstypene;
    private List<OpplysningtypeData> opplysningtypeData;
    private String tilgangsBeskrivelseForOpplysningstyper;
    private String lagringsBeskrivelseForOpplysningstyper;

    private boolean stemmerPersonkategorier;
    private boolean harInvolvertRepresentant;
    private String representantInvolveringsBeskrivelse;

    private boolean stemmerDatabehandlere;
    private boolean harDatabehandlerRepresentantInvolvering;
    private String dataBehandlerRepresentantInvolveringBeskrivelse;

    private List<PvkDokumentFil> pvkDokumentFiler;

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

                .ytterligereEgenskaper(copyOf(pvkDokument.getPvkDokumentData().getYtterligereEgenskaper()))
                .skalUtforePvk(pvkDokument.getPvkDokumentData().isSkalUtforePvk())
                .pvkVurderingsBegrunnelse(pvkDokument.getPvkDokumentData().getPvkVurderingsBegrunnelse())
                .stemmerOpplysningstypene(pvkDokument.getPvkDokumentData().isStemmerOpplysningstypene())
                .opplysningtypeData(copyOf(pvkDokument.getPvkDokumentData().getOpplysningtypeData()))
                .tilgangsBeskrivelseForOpplysningstyper(pvkDokument.getPvkDokumentData().getTilgangsBeskrivelseForOpplysningstyper())
                .lagringsBeskrivelseForOpplysningstyper(pvkDokument.getPvkDokumentData().getLagringsBeskrivelseForOpplysningstyper())
                .stemmerPersonkategorier(pvkDokument.getPvkDokumentData().isStemmerPersonkategorier())
                .harInvolvertRepresentant(pvkDokument.getPvkDokumentData().isHarInvolvertRepresentant())
                .representantInvolveringsBeskrivelse(pvkDokument.getPvkDokumentData().getRepresentantInvolveringsBeskrivelse())
                .stemmerDatabehandlere(pvkDokument.getPvkDokumentData().isStemmerDatabehandlere())
                .harDatabehandlerRepresentantInvolvering(pvkDokument.getPvkDokumentData().isHarDatabehandlerRepresentantInvolvering())
                .dataBehandlerRepresentantInvolveringBeskrivelse(pvkDokument.getPvkDokumentData().getDataBehandlerRepresentantInvolveringBeskrivelse())
                .build();
    }

}
