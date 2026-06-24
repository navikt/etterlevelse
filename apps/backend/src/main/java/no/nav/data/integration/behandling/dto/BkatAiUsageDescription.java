package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatAiUsageDescription {
    private Boolean aiUsage;
    private String description;
    private Boolean reusingPersonalInformation;
    private String startDate;
    private String endDate;
    private String registryNumber;
}
