package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.behandling.dto.Behandling;
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
    private String virkemiddelId;
    private boolean knyttetTilVirkemiddel;
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
    private CodelistResponse avdeling;
    private List<Varslingsadresse> varslingsadresser;
    private boolean hasCurrentUserAccess;
    
    public static EtterlevelseDokumentasjonResponse buildFrom(EtterlevelseDokumentasjon eDok) {
        return EtterlevelseDokumentasjonResponse.builder()
                .id(eDok.getId())
                .changeStamp(eDok.convertChangeStampResponse())
                .version(eDok.getVersion())
                .etterlevelseNummer(eDok.getEtterlevelseNummer())
                .title(eDok.getTitle())
                .beskrivelse(eDok.getBeskrivelse())
                .gjenbrukBeskrivelse(eDok.getGjenbrukBeskrivelse())
                .tilgjengeligForGjenbruk(eDok.isTilgjengeligForGjenbruk())
                .behandlingIds(nullsafeCopyOf(eDok.getBehandlingIds()))
                .virkemiddelId(eDok.getVirkemiddelId())
                .irrelevansFor(eDok.irrelevantForAsCodes())
                .prioritertKravNummer(nullsafeCopyOf(eDok.getPrioritertKravNummer()))
                .forGjenbruk(eDok.isForGjenbruk())
                .teams(nullsafeCopyOf(eDok.getTeams()))
                .resources(nullsafeCopyOf(eDok.getResources()))
                .risikoeiere(nullsafeCopyOf(eDok.getRisikoeiere()))
                .behandlerPersonopplysninger(eDok.isBehandlerPersonopplysninger())
                .knyttetTilVirkemiddel(eDok.isKnyttetTilVirkemiddel())
                .avdeling(CodelistService.getCodelistResponse(ListName.AVDELING, eDok.getAvdeling()))
                .varslingsadresser(nullsafeCopyOf(eDok.getVarslingsadresser()))
                .build();
    }
    
}
