package no.nav.data.integration.p360.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class P360Document {

    public Integer Recno;
    public String DocumentNumber;
    public Boolean Successful;
    public String ErrorMessage;
    public String ErrorDetails;
}