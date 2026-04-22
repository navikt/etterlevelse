package no.nav.data.etterlevelse.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.NomSeksjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.domain.PvkVurdering;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardTableResponse {
    private UUID etterlevelseDokumentasjonId;
    private String etterlevelseDokumentasjonTittel;
    private Integer etterlevelseNummer;
    private Integer etterlevelseDokumentVersjon;
    private EtterlevelseDokumentasjonStatus etterlevelseDokumentasjonStatus;
    private List<String> teams;
    private List<TeamResponse> teamsData;
    private List<String> resources;
    private List<Resource> resourcesData;
    private List<String> risikoeiere;
    private List<Resource> risikoeiereData;
    private List<Behandling> behandlinger;
    private String nomAvdelingId;
    private String avdelingNavn;
    private List<NomSeksjon> seksjoner;

    //etterlevelse
    private Integer antallKrav;
    private Integer antallOppfyltKrav;
    private Integer oppfyltKravProsent;
    private LocalDateTime sistOppdatertEtterlevelse;

    //pvk
    private boolean hasPvkDocumentationStarted;
    private PvkVurdering pvkVurdering;
    private PvkDokumentStatus pvkStatus;
    private Integer antallRisikoscenario;
    private Integer antallHoyRisikoscenario;
    private Integer antallHoyRisikoEtterTiltak;
    private Integer antallIkkeIverksattTiltak;
    private Integer antallTiltakFristPassert;
    private LocalDateTime sistOppdatertPvk;

    public static DashboardTableResponse buildFrom(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse){
        return DashboardTableResponse.builder()
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonResponse.getId())
                .etterlevelseDokumentasjonTittel(etterlevelseDokumentasjonResponse.getTitle())
                .etterlevelseNummer(etterlevelseDokumentasjonResponse.getEtterlevelseNummer())
                .etterlevelseDokumentVersjon(etterlevelseDokumentasjonResponse.getEtterlevelseDokumentVersjon())
                .etterlevelseDokumentasjonStatus(etterlevelseDokumentasjonResponse.getStatus())
                .teams(etterlevelseDokumentasjonResponse.getTeams())
                .teamsData(etterlevelseDokumentasjonResponse.getTeamsData())
                .resources(etterlevelseDokumentasjonResponse.getResources())
                .resourcesData(etterlevelseDokumentasjonResponse.getResourcesData())
                .risikoeiere(etterlevelseDokumentasjonResponse.getRisikoeiere())
                .risikoeiereData(etterlevelseDokumentasjonResponse.getRisikoeiereData())
                .behandlinger(etterlevelseDokumentasjonResponse.getBehandlinger())
                .nomAvdelingId(Objects.equals(etterlevelseDokumentasjonResponse.getNomAvdelingId(), "") ? "ingen-avdeling" : etterlevelseDokumentasjonResponse.getNomAvdelingId())
                .avdelingNavn(Objects.equals(etterlevelseDokumentasjonResponse.getAvdelingNavn(), "") ? "Ikke valgt avdeling" : etterlevelseDokumentasjonResponse.getAvdelingNavn())
                .seksjoner(etterlevelseDokumentasjonResponse.getSeksjoner())
                .build();
    }
}
