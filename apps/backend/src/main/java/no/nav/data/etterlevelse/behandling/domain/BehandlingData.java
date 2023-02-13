package no.nav.data.etterlevelse.behandling.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.behandling.dto.BehandlingRequest;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehandlingData implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;

    private String behandlingId;
    // Codelist RELEVANS
    private List<String> irrelevansFor;
    
    public List<CodelistResponse> irrelevantForAsCodes() {
        return CodelistService.getCodelistResponseList(ListName.RELEVANS, irrelevansFor);
    }

    public void convert(BehandlingRequest request) {
        if (behandlingId == null) {
            behandlingId = request.getId();
        }
        irrelevansFor = copyOf(request.getIrrelevansFor());
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), "");
    }
}
