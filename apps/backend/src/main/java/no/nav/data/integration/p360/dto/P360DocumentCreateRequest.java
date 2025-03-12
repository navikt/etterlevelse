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
//FIXME: set default values instead of in controller
public class P360DocumentCreateRequest {

    private String CaseNumber;
    private String Archive;
    private String DefaultValueSet;
    private String Title;
    private String DocumentDate;
    private String Category;
    private String Status;
    private String AccessGroup;
    private String ResponsiblePersonEmail;
    private List<P360File> Files;
}
