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
public class P360DocumentPageResponse {
    private List<P360Document> Documents;
    private Integer TotalPageCount;
    private Integer TotalCount;
    private Boolean Successful;
    private String ErrorMessage;
    private String ErrorDetails;
}