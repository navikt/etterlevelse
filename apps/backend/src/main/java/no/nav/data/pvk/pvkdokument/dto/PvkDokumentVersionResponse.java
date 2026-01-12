package no.nav.data.pvk.pvkdokument.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentData;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentVersion;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PvkDokumentVersionResponse {
    private UUID id;
    private UUID pvkDokumentId;
    private UUID etterlevelseDokumentId;
    private PvkDokumentStatus status;
    private ChangeStampResponse changeStamp;
    private PvkDokumentData data;
    private Integer contentVersion;

    public static PvkDokumentVersionResponse buildFrom(PvkDokumentVersion version) {
        return PvkDokumentVersionResponse.builder()
                .id(version.getId())
                .pvkDokumentId(version.getPvkDokumentId())
                .etterlevelseDokumentId(version.getEtterlevelseDokumentId())
                .status(version.getStatus())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(version.getCreatedDate() == null ? LocalDateTime.now() : version.getCreatedDate())
                        .lastModifiedBy(version.getLastModifiedBy())
                        .lastModifiedDate(version.getLastModifiedDate() == null ? LocalDateTime.now() : version.getLastModifiedDate())
                        .build())
                .data(version.getPvkDokumentData())
                .contentVersion(version.getContentVersion())
                .build();
    }
}
