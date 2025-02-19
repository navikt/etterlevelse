package no.nav.data.integration.p360.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class P360CaseRequest {
        private String CaseType;
        private String DefaultValueSet;
        private String Title;
        private String Status;
        private String AccessCode;
        private String AccessGroup;
        private String ResponsiblePersonEmail;
}
