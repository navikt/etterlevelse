package no.nav.data.etterlevelse.krav.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;
import no.nav.data.etterlevelse.krav.domain.SuksesskriteriumFlyt;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "navn", "beskrivelse"})
public class SuksesskriterieResponse {

    private int id;
    private String navn;
    private String beskrivelse;
    private boolean behovForBegrunnelse;
    private List<SuksesskriterieStatus> deaktiverteSuksesskriterieStatus;
    private SuksesskriteriumFlyt oppfyltStatusFlyt;
    private Integer hopperOverTilSuksesskriterieIndexForOppfyltFlyt;
    private SuksesskriteriumFlyt ikkeOppfyltStatusFlyt;
    private Integer hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt;
    private SuksesskriteriumFlyt ikkeRelevantStatusFlyt;
    private Integer hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt;

}
