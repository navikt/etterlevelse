package no.nav.data.integration.p360.dto;


import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldNameConstants;

@Data
@Builder
@FieldNameConstants
public class P360Document {

    //public Integer Recno;
    public String DocumentNumber;
    public Boolean Successful;
    public String ErrorMessage;
    public String ErrorDetails;
}