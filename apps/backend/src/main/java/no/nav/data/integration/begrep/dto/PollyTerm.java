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
@JsonPropertyOrder({"id", "name", "description"})
public class PollyTerm {

    private String id;
    private String name;
    private String description;

    public BegrepResponse toResponse() {
        return BegrepResponse.builder()
                .id(id)
                .navn(name)
                .beskrivelse(description)
                .build();
    }
}
