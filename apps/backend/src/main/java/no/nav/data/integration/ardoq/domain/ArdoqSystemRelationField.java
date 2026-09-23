package no.nav.data.integration.ardoq.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqSystemRelationField {
    private String ardoqId;
    private UUID etterlevelseDokumentId;
}
