package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Krav extends DomainObject implements KravId {

    private Integer kravNummer;
    @Default
    private Integer kravVersjon = 1;
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

    // Updates all fields from the request except id, kravNummer, kravVersjon, version and changestamp
    public Krav merge(KravRequest request) {
        navn = request.getNavn();
        beskrivelse = request.getBeskrivelse();
        hensikt = request.getHensikt();
        utdypendeBeskrivelse = request.getUtdypendeBeskrivelse();
        versjonEndringer = request.getVersjonEndringer();

        dokumentasjon = copyOf(request.getDokumentasjon());
        implementasjoner = request.getImplementasjoner();
        begrepIder = copyOf(request.getBegrepIder());
        virkemiddelIder = copyOf(request.getVirkemiddelIder());
        varslingsadresser = copyOf(request.getVarslingsadresser());
        rettskilder = copyOf(request.getRettskilder());
        tagger = copyOf(request.getTagger());
        regelverk = StreamUtils.convert(request.getRegelverk(), Regelverk::convert);

        avdeling = request.getAvdeling();
        underavdeling = request.getUnderavdeling();
        relevansFor = copyOf(request.getRelevansFor());
        status = request.getStatus();
        notat = request.getNotat();
        varselMelding = request.getVarselMelding();

        suksesskriterier = StreamUtils.convert(request.getSuksesskriterier(), Suksesskriterie::fromRequest);
        kravIdRelasjoner = copyOf(request.getKravIdRelasjoner());
        aktivertDato = request.getAktivertDato();

        return this;
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), navn, "K" + kravNummer + "." + kravVersjon);
    }
    
    public boolean supersedes(Krav other) {
        return other.getKravNummer().equals(getKravNummer()) && (
                getStatus().supersedes(other.getStatus())
                        || (!other.getStatus().supersedes(getStatus()) && other.getKravVersjon() < getKravVersjon())
        );
    }

}
