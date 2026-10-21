package no.nav.data.integration.p360.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

import java.util.List;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class P360UserPageResponse {
    @JsonProperty("Users")
    private List<P360UserResponse> users;
    @JsonProperty("TotalPageCount")
    private int totalPageCount;
    @JsonProperty("TotalCount")
    private int totalCount;
    @JsonProperty("Successful")
    private boolean successful;
    @JsonProperty("ErrorMessage")
    private String errorMessage;
    @JsonProperty("ErrorDetails")
    private String errorDetails;
}
