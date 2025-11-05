package no.nav.data.pvk.pvotilbakemelding.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.pvk.pvotilbakemelding.domain.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "pvkDokumentId", "status"})
public class PvoTilbakemeldingResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private String pvkDokumentId;
    private PvoTilbakemeldingStatus status;

    private List<VurderingResponse> vurderinger;

    public static PvoTilbakemeldingResponse buildFrom(PvoTilbakemelding pvoTilbakemelding) {
        return PvoTilbakemeldingResponse.builder()
                .id(pvoTilbakemelding.getId())
                .changeStamp(ChangeStampResponse.builder()
                        .createdDate(pvoTilbakemelding.getCreatedDate() == null ? LocalDateTime.now() : pvoTilbakemelding.getCreatedDate())
                        .lastModifiedBy(pvoTilbakemelding.getLastModifiedBy())
                        .lastModifiedDate(pvoTilbakemelding.getLastModifiedDate() == null ? LocalDateTime.now() : pvoTilbakemelding.getLastModifiedDate())
                        .build())
                .version(pvoTilbakemelding.getVersion())
                .pvkDokumentId(pvoTilbakemelding.getPvkDokumentId().toString())
                .status(pvoTilbakemelding.getStatus())

                .vurderinger(copyOf(convert(pvoTilbakemelding.getPvoTilbakemeldingData().getVurderinger(), VurderingResponse::buildFrom)))
                .build();
    }
}
