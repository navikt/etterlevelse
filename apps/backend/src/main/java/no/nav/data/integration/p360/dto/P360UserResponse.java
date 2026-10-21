package no.nav.data.integration.p360.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class P360UserResponse {
    @JsonProperty("ContactExternalId")
    private String contactExternalId;
    @JsonProperty("IsActive")
    private Boolean isActive;
}
