package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.common.domain.ExternalCode;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PolicyResponse {
    private String id;
    private String opplysningsTypeId;
    private String opplysningsTypeNavn;
    private ExternalCode sensitivity;
    private List<ExternalCode> personKategorier;
    private String behandlingId;

}
