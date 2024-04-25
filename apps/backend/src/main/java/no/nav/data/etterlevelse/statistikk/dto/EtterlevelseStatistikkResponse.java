package no.nav.data.etterlevelse.statistikk.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelse.dto.SuksesskriterieBegrunnelseResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"UUID", "kravNummer", "kravVersjon", "status", "ferdigDokumentertDato"})
public class EtterlevelseStatistikkResponse {
    private UUID id;

    private String etterlevelseDokumentasjonId;
    private String etterlevelseDokumentasjonTittel;
    private String etterlevelseDokumentasjonNummer;
    private String ansvarligId;
    private String ansvarlig;
    private Integer kravNummer;
    private Integer kravVersjon;
    private Boolean etterleves;
    private List<String> dokumentasjon;
    private LocalDate fristForFerdigstillelse;
    private EtterlevelseStatus status;
    private List<SuksesskriterieBegrunnelseResponse> suksesskriterieBegrunnelser;
    private String statusBegrunnelse;

    private Integer antallSuksesskriterie;
    private List<Integer> ikkeRelevantSuksesskriterieIder;
    private List<Integer> underArbeidSuksesskriterieIder;
    private List<Integer> oppfyltSuksesskriterieIder;
    private List<Integer> ikkeOppfyltSuksesskriterieIder;

    private LocalDateTime lastModifiedDate;
    private LocalDateTime createdDate;
    private LocalDateTime ferdigDokumentertDato;

    private List<String> team;
    private List<String> teamId;
    private String tema;
}
