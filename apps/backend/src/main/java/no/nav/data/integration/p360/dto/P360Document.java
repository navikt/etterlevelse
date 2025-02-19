package no.nav.data.integration.p360.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class P360Document {

    private Integer Recno;
    private String DocumentNumber;
    private String Title;
    private Boolean Successful;
    private String ErrorMessage;
    private String ErrorDetails;
}
