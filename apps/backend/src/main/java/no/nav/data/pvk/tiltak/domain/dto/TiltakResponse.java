package no.nav.data.pvk.tiltak.domain.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakData;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "behandlingId", "etterlevelseDokumentasjonId", "webSakNummer", "arkiveringDato", "status"})
public class TiltakResponse {

    private UUID id;
    private String pvkDokumentId;
    private String navn;
    private String beskrivelse;
    private String ansvarlig;
    private LocalDate frist;
    private List<String> risikoscenarioer; // Evt. (Id, navn)

    public static TiltakResponse buildFrom(Tiltak tiltak) {
        TiltakData td = tiltak.getTiltakData();
        return builder()
                .id (tiltak.getId())
                .pvkDokumentId(tiltak.getPvkDokument().getId().toString()) // FIXME: Riktig med toString her?
                .navn(td.getNavn())
                .beskrivelse(td.getBeskrivelse())
                .ansvarlig(td.getAnsvarlig())
                .frist(td.getFrist())
                .build();
    }
    
}
