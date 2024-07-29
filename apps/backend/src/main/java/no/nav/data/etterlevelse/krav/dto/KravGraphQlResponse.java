package no.nav.data.etterlevelse.krav.dto;


import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.varsel.dto.VarslingsadresseGraphQlResponse;
import no.nav.data.etterlevelse.virkemiddel.dto.VirkemiddelResponse;
import no.nav.data.integration.begrep.dto.BegrepResponse;

import java.util.List;

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
}
