package no.nav.data.integration.p360.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class P360Document {

    public Integer Recno;
    public String DocumentNumber;
    public Boolean Successful;
    public String ErrorMessage;
    public String ErrorDetails;
}