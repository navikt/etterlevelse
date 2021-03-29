package no.nav.data.integration.begrep.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "navn", "beskrivelse"})
public class BegrepResponse {

    private String id;
    private String navn;
    private String beskrivelse;
}
