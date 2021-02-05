package no.nav.data.etterlevelse.krav.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"lov", "spesifisering"})
public class RegelverkResponse {

    // Codelist LOV
    private CodelistResponse lov;
    private String spesifisering;

}
