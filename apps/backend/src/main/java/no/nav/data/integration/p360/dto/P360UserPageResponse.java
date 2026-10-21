package no.nav.data.integration.p360.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
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
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class P360UserPageResponse {
    private List<P360UserResponse> Users;
    private int TotalPageCount;
    private int TotalCount;
    private boolean Successful;
    private String ErrorMessage;
    private String ErrorDetails;
}
