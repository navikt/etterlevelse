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
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.util.List;

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

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), title, "E" + etterlevelseNummer);
    }
}
