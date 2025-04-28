package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class KravData extends DomainObject {

    private String navn;
    private String beskrivelse;
    private String hensikt;
    private String utdypendeBeskrivelse;
    private String versjonEndringer;
    private String notat;
    private String varselMelding;

    private List<String> dokumentasjon; // Inneholder både lenke og beskrivelse, formattert som markdown
    private String implementasjoner;
    private List<String> begrepIder;
    private List<String> virkemiddelIder;
    private List<Varslingsadresse> varslingsadresser;
    private List<String> rettskilder;
    private List<String> tagger;
    @Builder.Default
    private List<Regelverk> regelverk = new ArrayList<Regelverk>();

    private List<Suksesskriterie> suksesskriterier;

    // Codelist AVDELING
    private String avdeling;
    // Codelist UNDERAVDELING
    private String underavdeling;
    // Codelist RELEVANS
    private List<String> relevansFor;

    private List<String> kravIdRelasjoner;

    private LocalDateTime aktivertDato;

    @Default
    private KravStatus status = KravStatus.UTKAST;

}
