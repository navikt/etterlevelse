package no.nav.data.pvk.pvkdokument.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentFil;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;

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

    private List<CodelistResponse> ytterligereEgenskaper;
    private boolean skalUtforePvk;
    private String pvkVurderingsBegrunnelse;
    private boolean stemmerPersonkategorier;
    private String personkategoriAntallBeskrivelse;
    private String tilgangsBeskrivelsePersonopplysningene;
    private String lagringsBeskrivelsePersonopplysningene;

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

                .ytterligereEgenskaper(pvkDokument.getPvkDokumentData().ytterligereEgenskaperAsCodes())
                .skalUtforePvk(pvkDokument.getPvkDokumentData().isSkalUtforePvk())
                .pvkVurderingsBegrunnelse(pvkDokument.getPvkDokumentData().getPvkVurderingsBegrunnelse())
                .personkategoriAntallBeskrivelse(pvkDokument.getPvkDokumentData().getPersonkategoriAntallBeskrivelse())
                .tilgangsBeskrivelsePersonopplysningene(pvkDokument.getPvkDokumentData().getTilgangsBeskrivelsePersonopplysningene())
                .lagringsBeskrivelsePersonopplysningene(pvkDokument.getPvkDokumentData().getLagringsBeskrivelsePersonopplysningene())
                .stemmerPersonkategorier(pvkDokument.getPvkDokumentData().isStemmerPersonkategorier())
                .harInvolvertRepresentant(pvkDokument.getPvkDokumentData().isHarInvolvertRepresentant())
                .representantInvolveringsBeskrivelse(pvkDokument.getPvkDokumentData().getRepresentantInvolveringsBeskrivelse())
                .stemmerDatabehandlere(pvkDokument.getPvkDokumentData().isStemmerDatabehandlere())
                .harDatabehandlerRepresentantInvolvering(pvkDokument.getPvkDokumentData().isHarDatabehandlerRepresentantInvolvering())
                .dataBehandlerRepresentantInvolveringBeskrivelse(pvkDokument.getPvkDokumentData().getDataBehandlerRepresentantInvolveringBeskrivelse())
                .build();
    }

}
