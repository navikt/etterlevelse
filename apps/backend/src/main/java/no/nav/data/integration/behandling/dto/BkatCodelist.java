package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatCodelist {
    private BkatListName list;
    private String code;
    private String shortName;
    private String description;
    private Boolean invalidCode;
}
