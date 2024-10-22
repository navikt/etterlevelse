package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatPolicy {

    private String id;
    private String processId;
    @Singular
    private List<BkatCode> subjectCategories;
    private String informationTypeId;
    private BkatInformationTypeShort informationType;

    public PolicyResponse convertToPolyResponse(){
        return PolicyResponse.builder()
                .id(id)
                .opplysningsTypeId(informationTypeId)
                .behandlingId(processId)
                .opplysningsTypeNavn(informationType.getName())
                .sensitivity(informationType.getSensitivity().convertToCode())
                .personKategorier(subjectCategories.stream().map(BkatCode::convertToCode).toList())
                .build();
    }
}
