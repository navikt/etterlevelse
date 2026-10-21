package no.nav.data.integration.p360.dto;

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
    private List<P360UserResponse> Users;
    private int TotalPageCount;
    private int TotalCount;
    private boolean Successful;
    private String ErrorMessage;
    private String ErrorDetails;
}
