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
    @Builder.Default
    private String Archive = "Saksdokument";

    @Builder.Default
    private String DefaultValueSet = "Etterlevelse";
    private String Title;
    private String DocumentDate;
    @Builder.Default
    private String Status = "J";
    @Builder.Default
    private String AccessGroup = "Alle ansatte i Nav";
    private String ResponsiblePersonIdNumber;
    private List<P360File> Files;
}
