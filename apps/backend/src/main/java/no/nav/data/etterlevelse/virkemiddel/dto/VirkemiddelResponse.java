package no.nav.data.etterlevelse.virkemiddel.dto;


import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.krav.dto.RegelverkResponse;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "navn"})
public class VirkemiddelResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private String navn;
    private CodelistResponse virkemiddelType;
    private List<RegelverkResponse> regelverk;
    private String livsSituasjon;
}
