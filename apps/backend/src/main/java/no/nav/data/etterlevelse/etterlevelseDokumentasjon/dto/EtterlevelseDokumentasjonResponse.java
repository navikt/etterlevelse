package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.dto.TeamResponse;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseNummer", "title", "behandlingId"})
public class EtterlevelseDokumentasjonResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private Integer etterlevelseNummer;
    private String title;
    private List<String> behandlingIds;
    private boolean behandlerPersonopplysninger;
    private String virkemiddelId;
    private boolean knyttetTilVirkemiddel;
    @Singular("relevansForSingle")
    private List<CodelistResponse> irrelevansFor;
    private boolean knytteTilTeam;
    @Singular("team")
    private List<String> teams;
    private List<TeamResponse> teamsData;
    private List<Behandling> behandlinger;
    private CodelistResponse avdeling;
}
