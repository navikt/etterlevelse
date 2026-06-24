package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatLegalBasis {
    private BkatCodelist gdpr;
    private BkatCodelist nationalLaw;
    private String description;
}
