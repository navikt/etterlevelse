package no.nav.data.etterlevelse.statistikk.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"behandlingId", "behandlingNavn"})
public class BehandligStatistikkResponse {
    private String etterlevelseDokumentasjonsId;
    private String etterlevelseDokumentasjonTittel;
    private String behandlingId;
    private String behandlingNavn;
    private String ansvarligId;
    private String ansvarlig;
    private List<String> team;
    private List<String> teamId;
    private LocalDateTime opprettetDato;
    private LocalDateTime endretDato;
    private Integer totalKrav;
    private Integer antallIkkeFiltrertKrav;
    private Integer antallBortfiltrertKrav;
    private Integer antallIkkePaabegynt;
    private Integer antallUnderArbeid;
    private Integer antallFerdigDokumentert;
}
