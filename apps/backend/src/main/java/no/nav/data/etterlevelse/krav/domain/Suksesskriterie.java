package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieRequest;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Suksesskriterie {

    private int id;
    private String navn;

    public static Suksesskriterie convert(SuksesskriterieRequest request) {
        return Suksesskriterie.builder()
                .id(request.getId())
                .navn(request.getNavn())
                .build();
    }

    public SuksesskriterieResponse toResponse() {
        return SuksesskriterieResponse.builder()
                .id(id)
                .navn(navn)
                .build();
    }

}
