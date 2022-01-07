package no.nav.data.etterlevelse.krav.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


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

}
