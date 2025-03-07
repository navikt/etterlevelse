package no.nav.data.integration.p360.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class P360CasePageResponse {
    private List<P360Case> Cases;
    private Integer TotalPageCount;
    private Integer TotalCount;
    private Boolean Successful;
    private String ErrorMessage;
    private String ErrorDetails;
}
