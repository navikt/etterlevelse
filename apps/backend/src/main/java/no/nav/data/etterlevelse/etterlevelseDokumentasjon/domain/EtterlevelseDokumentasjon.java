package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import lombok.AllArgsConstructor;
import lombok.Builder.Default;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.util.List;

import static java.util.List.copyOf;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseDokumentasjon extends DomainObject {

    private Integer etterlevelseNummer;

    private String title;
    private List<String> behandlingIds;
    private String beskrivelse;
    @Default
    private boolean behandlerPersonopplysninger = true;
    private String virkemiddelId;
    @Default
    private boolean knyttetTilVirkemiddel = true;
    @Default
    private boolean knytteTilTeam = true;
    private List<String> teams;
    private String avdeling;
    private List<String> irrelevansFor;
    private List<String> prioritertKravNummer;
    private List<Varslingsadresse> varslingsadresser;

    public List<CodelistResponse> irrelevantForAsCodes() {
        return CodelistService.getCodelistResponseList(ListName.RELEVANS, irrelevansFor);
    }

    // Updates all fields from the request except id, version and changestamp
    public void merge(EtterlevelseDokumentasjonRequest request) {
        etterlevelseNummer = request.getEtterlevelseNummer();
        title = request.getTitle();
        behandlingIds = copyOf(request.getBehandlingIds());
        beskrivelse = request.getBeskrivelse();
        virkemiddelId = request.getVirkemiddelId();
        irrelevansFor = copyOf(request.getIrrelevansFor());
        teams = copyOf(request.getTeams());
        behandlerPersonopplysninger = request.isBehandlerPersonopplysninger();
        knyttetTilVirkemiddel = request.isKnyttetTilVirkemiddel();
        knytteTilTeam = request.isKnytteTilTeam();
        avdeling = request.getAvdeling();
        prioritertKravNummer = copyOf(request.getPrioritertKravNummer());
        varslingsadresser = copyOf(request.getVarslingsadresser());
    }

    public EtterlevelseDokumentasjonResponse toResponse() {
        return EtterlevelseDokumentasjonResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .etterlevelseNummer(etterlevelseNummer)
                .title(title)
                .beskrivelse(beskrivelse)
                .behandlingIds(behandlingIds != null ? copyOf(behandlingIds) : List.of())
                .virkemiddelId(virkemiddelId)
                .irrelevansFor(irrelevantForAsCodes())
                .prioritertKravNummer(prioritertKravNummer != null ? copyOf(prioritertKravNummer) : List.of())
                .knytteTilTeam(knytteTilTeam)
                .teams(teams != null ? copyOf(teams) : List.of())
                .behandlerPersonopplysninger(behandlerPersonopplysninger)
                .knyttetTilVirkemiddel(knyttetTilVirkemiddel)
                .avdeling(CodelistService.getCodelistResponse(ListName.AVDELING, avdeling))
                .varslingsadresser(varslingsadresser != null ? copyOf(varslingsadresser): List.of())
                .build();
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), title, "E" + etterlevelseNummer);
    }
}
