package no.nav.data.etterlevelse.krav.dto;


import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.etterlevelse.varsel.dto.VarslingsadresseGraphQlResponse;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelResponse;
import no.nav.data.integration.begrep.dto.BegrepResponse;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@JsonPropertyOrder({"id", "kravNummer", "kravVersjon", "navn", "beskrivelse", "hensikt", "status"})
public class KravGraphQlResponse extends KravResponse implements KravId {
    private List<VarslingsadresseGraphQlResponse> varslingsadresserQl;
    private List<EtterlevelseResponse> etterlevelser;
    private List<TilbakemeldingResponse> tilbakemeldinger;
    private List<BegrepResponse> begreper;
    private List<VirkemiddelResponse>  virkemidler;
    private String prioriteringsId;

    public static KravGraphQlResponse buildFrom(Krav krav) {
        return KravGraphQlResponse.builder()
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
                .virkemiddelIder(copyOf(krav.getVirkemiddelIder()))
                .varslingsadresser(copyOf(krav.getVarslingsadresser()))
                .varslingsadresserQl(copyOf(convert(krav.getVarslingsadresser(), Varslingsadresse::toGraphQlResponse)))
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
