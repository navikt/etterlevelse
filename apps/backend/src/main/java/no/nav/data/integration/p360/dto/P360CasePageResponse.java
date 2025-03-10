package no.nav.data.integration.p360.dto;

import lombok.Data;

import java.util.List;

@Data
public class P360CasePageResponse {
    //private List<P360Case> Cases;
    //private Integer TotalPageCount;
    //private Integer TotalCount;
    private Boolean Successful;
    private String ErrorMessage;
    private String ErrorDetails;
}
