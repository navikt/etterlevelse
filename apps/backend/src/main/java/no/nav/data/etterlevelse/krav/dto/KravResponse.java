package no.nav.data.etterlevelse.krav.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

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

    private List<String> dokumentasjon; // Inneholder både lenke og beskrivelse, formattert som markdown
    private String implementasjoner;
    private List<String> begrepIder;
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
    
    public static KravResponse buildFromForNotKraveier(Krav krav) {
        var response = buildFrom(krav);
        response.getChangeStamp().setLastModifiedBy("Skjult");
        response.setVarslingsadresser(List.of());
        return response;
    }

    public static KravResponse buildFrom(Krav krav) {
        return KravResponse.builder()
                .id(krav.getId())
                .changeStamp(krav.convertChangeStampResponse())
                .version(krav.getVersion())
                .kravNummer(krav.getKravNummer())
                .kravVersjon(krav.getKravVersjon())
                .navn(krav.getNavn())
                .beskrivelse(krav.getBeskrivelse())
                .hensikt(krav.getHensikt())
                .utdypendeBeskrivelse(krav.getUtdypendeBeskrivelse())
                .versjonEndringer(krav.getVersjonEndringer())
                .dokumentasjon(copyOf(krav.getDokumentasjon()))
                .implementasjoner(krav.getImplementasjoner())
                .begrepIder(copyOf(krav.getBegrepIder()))
                .varslingsadresser(copyOf(krav.getVarslingsadresser()))
                .rettskilder(copyOf(krav.getRettskilder()))
                .tagger(copyOf(krav.getTagger()))
                .regelverk(StreamUtils.convert(krav.getRegelverk(), Regelverk::toResponse))
                .notat(krav.getNotat())
                .varselMelding(krav.getVarselMelding())
                .suksesskriterier(StreamUtils.convert(krav.getSuksesskriterier(), Suksesskriterie::toResponse))
                .avdeling(CodelistService.getCodelistResponse(ListName.AVDELING, krav.getAvdeling()))
                .underavdeling(CodelistService.getCodelistResponse(ListName.UNDERAVDELING, krav.getUnderavdeling()))
                .relevansFor(CodelistService.getCodelistResponseList(ListName.RELEVANS, krav.getRelevansFor()))
                .kravIdRelasjoner(copyOf(krav.getKravIdRelasjoner()))
                .status(krav.getStatus())
                .aktivertDato(krav.getAktivertDato())
                .build();
    }

}
