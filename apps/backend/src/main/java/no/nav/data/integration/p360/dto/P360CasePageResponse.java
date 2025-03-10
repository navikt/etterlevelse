package no.nav.data.integration.p360.dto;

import lombok.Data;

import java.util.List;

@Data
public class P360CasePageResponse {
    public List<P360Case> Cases;
    public Integer TotalPageCount;
    public Integer TotalCount;
    public Boolean Successful;
    public String ErrorMessage;
    public String ErrorDetails;
}
