package no.nav.data.pvk.pvotilbakemelding.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.Tilbakemeldingsinnhold;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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

    private Tilbakemeldingsinnhold behandlingenslivslop;
    private Tilbakemeldingsinnhold behandlingensArtOgOmfang;
    private Tilbakemeldingsinnhold innvolveringAvEksterne;
    private Tilbakemeldingsinnhold risikoscenarioEtterTiltakk;
    private String merknadTilEtterleverEllerRisikoeier;
    private LocalDateTime sendtDato;
    private List<String> ansvarlig;
    private List<Resource> ansvarligData;

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
                .sendtDato(pvoTilbakemelding.getPvoTilbakemeldingData().getSendtDato())
                .ansvarlig(pvoTilbakemelding.getPvoTilbakemeldingData().getAnsvarlig())

                .behandlingenslivslop(pvoTilbakemelding.getPvoTilbakemeldingData().getBehandlingenslivslop())
                .behandlingensArtOgOmfang(pvoTilbakemelding.getPvoTilbakemeldingData().getBehandlingensArtOgOmfang())
                .innvolveringAvEksterne(pvoTilbakemelding.getPvoTilbakemeldingData().getInnvolveringAvEksterne())
                .risikoscenarioEtterTiltakk(pvoTilbakemelding.getPvoTilbakemeldingData().getRisikoscenarioEtterTiltakk())
                .merknadTilEtterleverEllerRisikoeier(pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier())

                .build();
    }
}
