package no.nav.data.pvk.behandlingensArtOgOmfang.dto;


import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfang;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseDokumentId"})
public class BehandlingensArtOgOmfangResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private UUID etterlevelseDokumentId;

    private Boolean stemmerPersonkategorier;
    private String personkategoriAntallBeskrivelse;
    private String tilgangsBeskrivelsePersonopplysningene;
    private String lagringsBeskrivelsePersonopplysningene;


    public static BehandlingensArtOgOmfangResponse buildFrom(BehandlingensArtOgOmfang behandlingensArtOgOmfang) {
        return BehandlingensArtOgOmfangResponse.builder()
                .id(behandlingensArtOgOmfang.getId())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(behandlingensArtOgOmfang.getCreatedDate() == null ? LocalDateTime.now() : behandlingensArtOgOmfang.getCreatedDate())
                        .lastModifiedBy(behandlingensArtOgOmfang.getLastModifiedBy())
                        .lastModifiedDate(behandlingensArtOgOmfang.getLastModifiedDate() == null ? LocalDateTime.now() : behandlingensArtOgOmfang.getLastModifiedDate())
                        .build())
                .version(behandlingensArtOgOmfang.getVersion())
                .etterlevelseDokumentId(behandlingensArtOgOmfang.getEtterlevelseDokumentId())

                .stemmerPersonkategorier(behandlingensArtOgOmfang.getBehandlingensArtOgOmfangData().getStemmerPersonkategorier())
                .personkategoriAntallBeskrivelse(behandlingensArtOgOmfang.getBehandlingensArtOgOmfangData().getPersonkategoriAntallBeskrivelse())
                .tilgangsBeskrivelsePersonopplysningene(behandlingensArtOgOmfang.getBehandlingensArtOgOmfangData().getTilgangsBeskrivelsePersonopplysningene())
                .lagringsBeskrivelsePersonopplysningene(behandlingensArtOgOmfang.getBehandlingensArtOgOmfangData().getLagringsBeskrivelsePersonopplysningene())
                .build();
    }
}
