package no.nav.data.etterlevelse.kravprioritylist.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.kravprioritylist.dto.KravPriorityListRequest;
import no.nav.data.etterlevelse.kravprioritylist.dto.KravPriorityListResponse;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;


@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class KravPriorityList extends DomainObject {
    private String temaId;
    private List<Integer> priorityList;

    public KravPriorityList convert(KravPriorityListRequest request) {
        temaId = request.getTemaId();
        priorityList = copyOf(request.getPriorityList());
        return this;
    }

    public KravPriorityListResponse toResponse() {
        return KravPriorityListResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)

                .temaId(temaId)
                .priorityList(priorityList)
                .build();
    }

}
