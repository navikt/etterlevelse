package no.nav.data.etterlevelse.codelist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.domain.ListName;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "data")
@JsonPropertyOrder({"list", "code", "shortName", "description", "data"})
public class CodelistResponse {

    private ListName list;
    private String code;
    private String shortName;
    private String description;
    private JsonNode data;

    @Override
    public String toString() {
        return code + " - " + shortName + " - " + description;
    }

    @JsonInclude(Include.NON_NULL)
    public Boolean isInvalidCode() {
        return description == null ? Boolean.TRUE : null;
    }
}
