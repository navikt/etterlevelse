package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonData;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.NomSeksjon;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.dto.ProductAreaResponse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.TeamResponse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.ListUtils.nullsafeCopyOf;

@Data
@SuperBuilder
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
    private String beskrivelse;
    private String gjenbrukBeskrivelse;
    private boolean tilgjengeligForGjenbruk;
    private boolean behandlerPersonopplysninger;

    private EtterlevelseDokumentasjonStatus status = EtterlevelseDokumentasjonStatus.UNDER_ARBEID;

    private String meldingEtterlevelerTilRisikoeier;
    private String meldingRisikoeierTilEtterleveler;

    @Singular("relevansForSingle")
    private List<CodelistResponse> irrelevansFor;
    private List<String> prioritertKravNummer;
    private boolean forGjenbruk;
    @Singular("team")
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

    private ProductAreaResponse produktOmradetData;
    private List<String> risikovurderinger; // Inneholder både lenke og beskrivelse, formattert som markdown
    private List<Varslingsadresse> varslingsadresser;
    private boolean hasCurrentUserAccess;

    private Integer P360Recno;
    private String P360CaseNumber;
    
    public static EtterlevelseDokumentasjonResponse buildFrom(EtterlevelseDokumentasjon eDok) {
        EtterlevelseDokumentasjonData eDokData = eDok.getEtterlevelseDokumentasjonData();
        return EtterlevelseDokumentasjonResponse.builder()
                .id(eDok.getId())
                .changeStamp(ChangeStampResponse.buildFrom(eDok))
                .version(eDok.getVersion())
                .etterlevelseNummer(eDokData.getEtterlevelseNummer())
                .title(eDokData.getTitle())
                .beskrivelse(eDokData.getBeskrivelse())
                .status(eDokData.getStatus())
                .meldingEtterlevelerTilRisikoeier(eDokData.getMeldingEtterlevelerTilRisikoeier())
                .meldingRisikoeierTilEtterleveler(eDokData.getMeldingRisikoeierTilEtterleveler())
                .gjenbrukBeskrivelse(eDokData.getGjenbrukBeskrivelse())
                .tilgjengeligForGjenbruk(eDokData.isTilgjengeligForGjenbruk())
                .behandlingIds(nullsafeCopyOf(eDokData.getBehandlingIds()))
                .irrelevansFor(eDok.irrelevantForAsCodes())
                .prioritertKravNummer(nullsafeCopyOf(eDokData.getPrioritertKravNummer()))
                .forGjenbruk(eDokData.isForGjenbruk())
                .teams(nullsafeCopyOf(eDokData.getTeams()))
                .resources(nullsafeCopyOf(eDokData.getResources()))
                .risikoeiere(nullsafeCopyOf(eDokData.getRisikoeiere()))
                .behandlerPersonopplysninger(eDokData.isBehandlerPersonopplysninger())
                .nomAvdelingId(eDokData.getNomAvdelingId())
                .avdelingNavn(eDokData.getAvdelingNavn())
                .seksjoner(nullsafeCopyOf(eDokData.getSeksjoner()))
                .varslingsadresser(nullsafeCopyOf(eDokData.getVarslingsadresser()))
                .risikovurderinger(eDokData.getRisikovurderinger())
                .P360Recno(eDokData.getP360Recno())
                .P360CaseNumber(eDokData.getP360CaseNumber())
                .build();
    }
    
}
