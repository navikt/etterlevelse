package no.nav.data.integration.nom.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

import java.util.List;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class OrgEnhet {
    private String id;
    private String navn;
    private List<Organisering> organiseringer;
    private OrgEnhetsType orgEnhetsType;
    private NomNivaa nomNivaa;
}
