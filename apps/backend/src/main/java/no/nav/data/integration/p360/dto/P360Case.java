package no.nav.data.integration.p360.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class P360Case {

    public Integer Recno;
    public String CaseNumber;
    public String Title;
    public Boolean Successful;
    public String ErrorMessage;
    public String ErrorDetails;

}