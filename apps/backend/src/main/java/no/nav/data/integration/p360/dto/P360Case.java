package no.nav.data.integration.p360.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class P360Case {

    private Integer Recno;
    private String CaseNumber;
    private String Title;
    private Boolean Successful;
    private String ErrorMessage;
    private String ErrorDetails;

}