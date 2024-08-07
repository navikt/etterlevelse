package no.nav.data.etterlevelse.krav.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "kravNummer", "kravVersjon", "navn", "beskrivelse", "hensikt", "status"})
public class KravResponse implements KravId {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private Integer kravNummer;
    private Integer kravVersjon;
    private String navn;
    private String beskrivelse;
    private String hensikt;
    private String utdypendeBeskrivelse;
    private String versjonEndringer;
    private String notat;
    private String varselMelding;

    private List<String> dokumentasjon;
    private String implementasjoner;
    private List<String> begrepIder;
    private List<String> virkemiddelIder;
    private List<Varslingsadresse> varslingsadresser;
    private List<String> rettskilder;
    private List<String> tagger;
    private List<RegelverkResponse> regelverk;

    private List<SuksesskriterieResponse> suksesskriterier;
    private List<String> kravIdRelasjoner;
    private CodelistResponse avdeling;
    private CodelistResponse underavdeling;
    private List<CodelistResponse> relevansFor;
    private KravStatus status;
    private LocalDateTime aktivertDato;
}
