package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.*;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;
import static no.nav.data.common.utils.StringUtils.formatList;
import static no.nav.data.common.utils.StringUtils.formatListToUppercase;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseDokumentasjonRequest implements RequestElement {

    private UUID id;
    private Boolean update;
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

    @Schema(description = "Codelist RELEVANS")
    private List<String> irrelevansFor;
    private List<String> prioritertKravNummer;
    private List<String> risikovurderinger; // Inneholder både lenke og beskrivelse, formattert som markdown
    private boolean forGjenbruk;
    private List<String> teams;
    private List<String> resources;
    private List<String> risikoeiere;

    private Integer P360Recno;
    private String P360CaseNumber;

    private String nomAvdelingId;
    private String avdelingNavn;
    private List<NomSeksjon> seksjoner;

    private List<Varslingsadresse> varslingsadresser;

    //versjonering
    private Integer etterlevelseDokumentVersjon;
    private List<EtterlevelseVersjonHistorikk> versjonHistorikk;

    @Override
    public void format() {
        setTitle(trimToNull(title));
        setBeskrivelse(trimToNull(beskrivelse));
        setMeldingRisikoeierTilEtterleveler(trimToNull(meldingRisikoeierTilEtterleveler));
        setMeldingEtterlevelerTilRisikoeier(trimToNull(meldingEtterlevelerTilRisikoeier));
        setGjenbrukBeskrivelse(trimToNull(gjenbrukBeskrivelse));
        setBehandlingIds(formatList(behandlingIds));
        setIrrelevansFor(formatListToUppercase(irrelevansFor));
        setTeams(formatList(teams));
        setResources(formatList(resources));
        setRisikoeiere(formatList(risikoeiere));
        setVarslingsadresser(copyOf(varslingsadresser));
        setNomAvdelingId(nomAvdelingId);
        setAvdelingNavn(avdelingNavn);
        setRisikovurderinger(formatList(risikovurderinger));
        setP360Recno(P360Recno);
        setP360CaseNumber(trimToNull(P360CaseNumber));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkCodelists(EtterlevelseDokumentasjonRequest.Fields.irrelevansFor, irrelevansFor, ListName.RELEVANS);
        validator.validateType(Fields.varslingsadresser, varslingsadresser);
    }
    
    // Updates all fields of an EtterlevelseDokumentasjon except id, version and changestamp
    public void mergeInto(EtterlevelseDokumentasjon eDok) {
        EtterlevelseDokumentasjonData eDokData = eDok.getEtterlevelseDokumentasjonData();
        eDok.setEtterlevelseNummer(etterlevelseNummer);
        eDokData.setTitle(title);
        eDokData.setBehandlingIds(copyOf(behandlingIds));
        eDokData.setBeskrivelse(beskrivelse);
        eDokData.setGjenbrukBeskrivelse(gjenbrukBeskrivelse);
        eDokData.setStatus(status);
        eDokData.setMeldingEtterlevelerTilRisikoeier(meldingEtterlevelerTilRisikoeier);
        eDokData.setMeldingRisikoeierTilEtterleveler(meldingRisikoeierTilEtterleveler);
        eDokData.setTilgjengeligForGjenbruk(tilgjengeligForGjenbruk);
        eDokData.setIrrelevansFor(copyOf(irrelevansFor));
        eDokData.setTeams(copyOf(teams));
        eDokData.setResources(copyOf(resources));
        eDokData.setRisikoeiere(copyOf(risikoeiere));
        eDokData.setBehandlerPersonopplysninger(behandlerPersonopplysninger);
        eDokData.setForGjenbruk(forGjenbruk);
        eDokData.setNomAvdelingId(nomAvdelingId);
        eDokData.setAvdelingNavn(avdelingNavn);
        eDokData.setSeksjoner(copyOf(seksjoner));
        eDokData.setPrioritertKravNummer(copyOf(prioritertKravNummer));
        eDokData.setVarslingsadresser(copyOf(varslingsadresser));
        eDokData.setRisikovurderinger(copyOf(risikovurderinger));
        eDokData.setP360Recno(P360Recno);
        eDokData.setP360CaseNumber(P360CaseNumber);
        eDokData.setEtterlevelseDokumentVersjon(etterlevelseDokumentVersjon);
        eDokData.setVersjonHistorikk(copyOf(versjonHistorikk));
    }

}
