package no.nav.data.etterlevelse.etterlevelse.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "behandlingId", "etterlevelseDokumentasjonId", "kravNummer", "kravVersjon", "etterleves", "begrunnelse", "dokumentasjon", "fristForFerdigstillelse", "status", "behandling", "suksesskriterieBegrunnelser"})
public class EtterlevelseResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private String behandlingId;
    private String etterlevelseDokumentasjonId;
    private Integer kravNummer;
    private Integer kravVersjon;

    private boolean etterleves;
    private String statusBegrunnelse;
    private List<String> dokumentasjon;
    private LocalDate fristForFerdigstillelse;
    private EtterlevelseStatus status;
    private List<SuksesskriterieBegrunnelseResponse> suksesskriterieBegrunnelser;

    // GraphQL only
    @JsonIgnore
    private EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon;

}
