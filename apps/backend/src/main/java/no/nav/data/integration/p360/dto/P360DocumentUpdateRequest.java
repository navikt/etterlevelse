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
public class P360DocumentUpdateRequest {

    private String DocumentNumber;
    private String Archive;
    private String DefaultValueSet;
    private String Title;
    private String DocumentDate;
    private String Status;
    private String AccessGroup;
    private String ResponsiblePersonIdNumber;
    private List<P360File> Files;
}
