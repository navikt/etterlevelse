package no.nav.data.pvk.tiltak.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakData;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "behandlingId", "etterlevelseDokumentasjonId", "webSakNummer", "arkiveringDato", "status"})
public class TiltakResponse {

    private String id;
    private String pvkDokumentId;
    private String navn;
    private String beskrivelse;
    private String ansvarlig;
    private LocalDate frist;
    private List<String> risikoscenarioIds;

    public static TiltakResponse buildFrom(Tiltak tiltak) {
        TiltakData td = tiltak.getTiltakData();
        return builder()
                .id(tiltak.getId().toString())
                .pvkDokumentId(tiltak.getPvkDokumentId())
                .navn(td.getNavn())
                .beskrivelse(td.getBeskrivelse())
                .ansvarlig(td.getAnsvarlig())
                .frist(td.getFrist())
                .build();
    }
    
}
