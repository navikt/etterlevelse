package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.dto.RegelverkRequest;
import no.nav.data.etterlevelse.krav.dto.RegelverkResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Regelverk {

    // Codelist LOV
    private String lov;
    private String spesifisering;

    public RegelverkResponse toResponse() {
        return RegelverkResponse.builder()
                .lov(CodelistService.getCodelistResponse(ListName.LOV, lov))
                .spesifisering(spesifisering)
                .build();
    }

    public static Regelverk convert(RegelverkRequest request) {
        return Regelverk.builder()
                .lov(request.getLov())
                .spesifisering(request.getSpesifisering())
                .build();
    }
}
