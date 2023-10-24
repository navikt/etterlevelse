package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.domain.dto.KravIdStatus;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Krav implements DomainObject, KravIdStatus {

    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

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

    private List<String> dokumentasjon;
    private String implementasjoner;
    private List<String> begrepIder;
    private List<String> virkemiddelIder;
    private List<Varslingsadresse> varslingsadresser;
    private List<String> rettskilder;
    private List<String> tagger;
    private List<Regelverk> regelverk;

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

    public Krav convert(KravRequest request) {
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

        suksesskriterier = StreamUtils.convert(request.getSuksesskriterier(), Suksesskriterie::convert);
        kravIdRelasjoner = copyOf(request.getKravIdRelasjoner());
        aktivertDato = request.getAktivertDato();

        return this;
    }

    public KravResponse toResponse() {
        var response = KravResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)
                .navn(navn)
                .beskrivelse(beskrivelse)
                .hensikt(hensikt)
                .utdypendeBeskrivelse(utdypendeBeskrivelse)
                .versjonEndringer(versjonEndringer)
                .dokumentasjon(copyOf(dokumentasjon))
                .implementasjoner(implementasjoner)
                .begrepIder(copyOf(begrepIder))
                .virkemiddelIder(copyOf(virkemiddelIder))
                .varslingsadresser(copyOf(varslingsadresser))
                .rettskilder(copyOf(rettskilder))
                .tagger(copyOf(tagger))
                .regelverk(StreamUtils.convert(regelverk, Regelverk::toResponse))
                .notat(notat)
                .varselMelding(varselMelding)
                .suksesskriterier(StreamUtils.convert(suksesskriterier, Suksesskriterie::toResponse))
                .avdeling(CodelistService.getCodelistResponse(ListName.AVDELING, avdeling))
                .underavdeling(CodelistService.getCodelistResponse(ListName.UNDERAVDELING, underavdeling))
                .relevansFor(CodelistService.getCodelistResponseList(ListName.RELEVANS, relevansFor))
                .kravIdRelasjoner(copyOf(kravIdRelasjoner))
                .status(status)
                .aktivertDato(aktivertDato)
                .build();
        if (!SecurityUtils.isKravEier()) {
            response.getChangeStamp().setLastModifiedBy("Skjult");
            response.setVarslingsadresser(List.of());
        }
        return response;
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), navn, "K" + kravNummer + "." + kravVersjon);
    }
}
