package no.nav.data.etterlevelse.statistikk.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.statistikk.dto.BehandligStatistikkResponse;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingStatistikk {
    private String behandlingId;
    private String behandlingNavn;
    private List<String> team;
    private LocalDateTime opprettetDato;
    private LocalDateTime endretDato;
    private Integer totalKrav;
    private Integer antallIkkeFiltrertKrav;
    private Integer antallBortfiltrertKrav;
    private Integer antallIkkePaabegynt;
    private Integer antallUnderArbeid;
    private Integer antallFerdigDokumentert;

public BehandligStatistikkResponse toResponse() {
    return BehandligStatistikkResponse.builder()
            .behandlingId(behandlingId)
            .behandlingNavn(behandlingNavn)
            .team(team)
            .opprettetDato(opprettetDato)
            .endretDato(endretDato)
            .totalKrav(totalKrav)
            .antallIkkeFiltrertKrav(antallIkkeFiltrertKrav)
            .antallBortfiltrertKrav(antallBortfiltrertKrav)
            .antallIkkePaabegynt(antallIkkePaabegynt)
            .antallUnderArbeid(antallUnderArbeid)
            .antallFerdigDokumentert(antallFerdigDokumentert)
            .build();
}
}
