package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieRequest;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieResponse;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Suksesskriterie {

    private int id;
    private String navn;
    private String beskrivelse;
    @Builder.Default
    private boolean behovForBegrunnelse = true;
    private List<SuksesskriterieStatus> deaktiverteSuksesskriterieStatus;
    @Builder.Default
    private SuksesskriteriumFlyt oppyltStatusFlyt = SuksesskriteriumFlyt.UNDEFINED;
    private Integer hopperOverTilSuksesskriterieIndexForOppyfltFlyt;
    @Builder.Default
    private SuksesskriteriumFlyt ikkeOppyltStatusFlyt = SuksesskriteriumFlyt.UNDEFINED;
    private Integer hopperOverTilSuksesskriterieIndexForIkkeOppyltFlyt;
    @Builder.Default
    private SuksesskriteriumFlyt ikkeRelevantStatusFlyt = SuksesskriteriumFlyt.UNDEFINED;
    private Integer hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt;

    public static Suksesskriterie fromRequest(SuksesskriterieRequest request) {
        return Suksesskriterie.builder()
                .id(request.getId())
                .navn(request.getNavn())
                .beskrivelse(request.getBeskrivelse())
                .behovForBegrunnelse(request.isBehovForBegrunnelse())
                .deaktiverteSuksesskriterieStatus(copyOf(request.getDeaktiverteSuksesskriterieStatus()))
                .oppyltStatusFlyt(request.getOppyltStatusFlyt())
                .hopperOverTilSuksesskriterieIndexForOppyfltFlyt(request.getHopperOverTilSuksesskriterieIndexForOppyfltFlyt())
                .ikkeOppyltStatusFlyt(request.getIkkeOppyltStatusFlyt())
                .hopperOverTilSuksesskriterieIndexForIkkeOppyltFlyt(request.getHopperOverTilSuksesskriterieIndexForIkkeOppyltFlyt())
                .ikkeRelevantStatusFlyt(request.getIkkeRelevantStatusFlyt())
                .hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt(request.getHopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt())
                .build();
    }

    public SuksesskriterieResponse toResponse() {
        return SuksesskriterieResponse.builder()
                .id(id)
                .navn(navn)
                .beskrivelse(beskrivelse)
                .behovForBegrunnelse(behovForBegrunnelse)
                .deaktiverteSuksesskriterieStatus(copyOf(deaktiverteSuksesskriterieStatus))
                .oppyltStatusFlyt(oppyltStatusFlyt)
                .hopperOverTilSuksesskriterieIndexForOppyfltFlyt(hopperOverTilSuksesskriterieIndexForOppyfltFlyt)
                .ikkeOppyltStatusFlyt(ikkeOppyltStatusFlyt)
                .hopperOverTilSuksesskriterieIndexForIkkeOppyltFlyt(hopperOverTilSuksesskriterieIndexForIkkeOppyltFlyt)
                .ikkeRelevantStatusFlyt(ikkeRelevantStatusFlyt)
                .hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt(hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt)
                .build();
    }

}
