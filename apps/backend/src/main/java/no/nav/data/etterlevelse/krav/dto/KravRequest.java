package no.nav.data.etterlevelse.krav.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.time.LocalDateTime;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;
import static no.nav.data.common.utils.StreamUtils.duplicates;
import static no.nav.data.common.utils.StringUtils.formatList;
import static no.nav.data.common.utils.StringUtils.formatListToUppercase;
import static no.nav.data.common.utils.StringUtils.toUpperCaseAndTrim;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class KravRequest implements RequestElement {

    private String id;

    private Integer kravNummer;
    private String navn;
    private String beskrivelse;
    private String hensikt;
    private String utdypendeBeskrivelse;
    private String versjonEndringer;
    private String notat;
    private String varselMelding;
    private String prioriteringsId;
    private List<String> dokumentasjon;
    private String implementasjoner;
    private List<String> begrepIder;
    private List<String> virkemiddelIder;
    private List<Varslingsadresse> varslingsadresser;
    private List<String> rettskilder;
    private List<String> tagger;
    private List<RegelverkRequest> regelverk;

    private List<SuksesskriterieRequest> suksesskriterier;

    private List<String> kravIdRelasjoner;

    private LocalDateTime aktivertDato;

    @Schema(description = "Codelist AVDELING")
    private String avdeling;
    @Schema(description = "Codelist UNDERAVDELING")
    private String underavdeling;

    @Schema(description = "Codelist RELEVANS")
    private List<String> relevansFor;
    private KravStatus status;
    private boolean nyKravVersjon;

    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setNavn(trimToNull(navn));
        setBeskrivelse(trimToNull(beskrivelse));
        setHensikt(trimToNull(hensikt));
        setUtdypendeBeskrivelse(trimToNull(utdypendeBeskrivelse));
        setVersjonEndringer(trimToNull(versjonEndringer));
        setRelevansFor(formatListToUppercase(relevansFor));
        setAvdeling(toUpperCaseAndTrim(avdeling));
        setUnderavdeling(toUpperCaseAndTrim(underavdeling));
        setNotat(trimToNull(notat));
        setVarselMelding(trimToNull(varselMelding));
        setPrioriteringsId(trimToNull(prioriteringsId));
        setDokumentasjon(formatList(dokumentasjon));
        setImplementasjoner(trimToNull(implementasjoner));
        setBegrepIder(formatList(begrepIder));
        setVirkemiddelIder(formatList(virkemiddelIder));
        setVarslingsadresser(copyOf(varslingsadresser));
        setRettskilder(formatList(rettskilder));
        setTagger(formatList(tagger));
        setSuksesskriterier(copyOf(suksesskriterier));
        setKravIdRelasjoner(copyOf(kravIdRelasjoner));
        if (status == null) {
            status = KravStatus.UTKAST;
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkId(this);
        validator.checkBlank(Fields.navn, navn);
        if (nyKravVersjon) {
            validator.checkNull(Fields.kravNummer, kravNummer);
        }
        validator.checkCodelist(Fields.avdeling, avdeling, ListName.AVDELING);
        validator.checkCodelist(Fields.underavdeling, underavdeling, ListName.UNDERAVDELING);
        validator.checkCodelists(Fields.relevansFor, relevansFor, ListName.RELEVANS);
        validator.validateType(Fields.varslingsadresser, varslingsadresser);
        validator.validateType(Fields.regelverk, regelverk);

        if(status != KravStatus.UTKAST) {
            validator.validateType(Fields.suksesskriterier, suksesskriterier);
        }

        if (duplicates(suksesskriterier, SuksesskriterieRequest::getId)) {
            validator.addError(Fields.suksesskriterier, "DUPLICATE_SUKSESSKRITERIE", "Dukplikat på suksesskriterie id");
        }
    }

}
