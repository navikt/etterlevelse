package no.nav.data.etterlevelse.statistikk.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.statistikk.dto.BehandligStatistikkResponse;

import java.time.LocalDateTime;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingStatistikk {
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

    public BehandligStatistikkResponse toResponse() {
        return BehandligStatistikkResponse.builder()
                .etterlevelseDokumentasjonsId(etterlevelseDokumentasjonsId)
                .etterlevelseDokumentasjonTittel(etterlevelseDokumentasjonTittel)
                .behandlingId(behandlingId)
                .behandlingNavn(behandlingNavn)
                .ansvarligId(ansvarligId)
                .ansvarlig(ansvarlig)
                .team(copyOf(team))
                .teamId(copyOf(teamId))
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
