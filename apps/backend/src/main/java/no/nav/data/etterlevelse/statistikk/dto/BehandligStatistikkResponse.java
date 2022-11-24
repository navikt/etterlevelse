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
    private String behandlingId;
    private String behandlingNavn;
    private List<String> team;
    private LocalDateTime opprettetDato;
    private LocalDateTime endretDato;
    private Integer totalKrav;
    private Integer antallIkkeFiltrertKrav;
    private Integer antallBortfiltrertKrav;
    private Integer antallIkkePåbegynt;
    private Integer underArbeid;
    private Integer antallFerdigDokumentert;
}
