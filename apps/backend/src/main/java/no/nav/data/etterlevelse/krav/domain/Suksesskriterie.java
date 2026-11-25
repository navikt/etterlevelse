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


    public static Suksesskriterie fromRequest(SuksesskriterieRequest request) {
        return Suksesskriterie.builder()
                .id(request.getId())
                .navn(request.getNavn())
                .beskrivelse(request.getBeskrivelse())
                .behovForBegrunnelse(request.isBehovForBegrunnelse())
                .deaktiverteSuksesskriterieStatus(copyOf(request.getDeaktiverteSuksesskriterieStatus()))
                .build();
    }

    public SuksesskriterieResponse toResponse() {
        return SuksesskriterieResponse.builder()
                .id(id)
                .navn(navn)
                .beskrivelse(beskrivelse)
                .behovForBegrunnelse(behovForBegrunnelse)
                .deaktiverteSuksesskriterieStatus(copyOf(deaktiverteSuksesskriterieStatus))
                .build();
    }

}
