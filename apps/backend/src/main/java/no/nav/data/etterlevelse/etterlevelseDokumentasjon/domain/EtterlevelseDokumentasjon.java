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
    private String gjenbrukBeskrivelse;
    @Default
    private boolean tilgjengeligForGjenbruk = false;
    @Default
    private boolean behandlerPersonopplysninger = true;
    private String virkemiddelId;
    @Default
    private boolean knyttetTilVirkemiddel = true;
    @Default
    private boolean forGjenbruk = false;
    private List<String> teams;
    private List<String> resources;
    private List<String> risikoeiere;
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
        gjenbrukBeskrivelse = request.getGjenbrukBeskrivelse();
        tilgjengeligForGjenbruk = request.isTilgjengeligForGjenbruk();
        virkemiddelId = request.getVirkemiddelId();
        irrelevansFor = copyOf(request.getIrrelevansFor());
        teams = copyOf(request.getTeams());
        resources = copyOf(request.getResources());
        risikoeiere = copyOf(request.getRisikoeiere());
        behandlerPersonopplysninger = request.isBehandlerPersonopplysninger();
        knyttetTilVirkemiddel = request.isKnyttetTilVirkemiddel();
        forGjenbruk = request.isForGjenbruk();
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
                .gjenbrukBeskrivelse(gjenbrukBeskrivelse)
                .tilgjengeligForGjenbruk(tilgjengeligForGjenbruk)
                .behandlingIds(behandlingIds != null ? copyOf(behandlingIds) : List.of())
                .virkemiddelId(virkemiddelId)
                .irrelevansFor(irrelevantForAsCodes())
                .prioritertKravNummer(prioritertKravNummer != null ? copyOf(prioritertKravNummer) : List.of())
                .forGjenbruk(forGjenbruk)
                .teams(teams != null ? copyOf(teams) : List.of())
                .resources(resources != null ? copyOf(resources) : List.of())
                .risikoeiere(risikoeiere != null ? copyOf(risikoeiere) : List.of())
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
