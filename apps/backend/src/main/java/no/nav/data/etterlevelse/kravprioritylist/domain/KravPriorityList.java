package no.nav.data.etterlevelse.kravprioritylist.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.export.domain.EtterlevelseMedKravData;
import no.nav.data.etterlevelse.kravprioritylist.dto.KravPriorityListRequest;
import no.nav.data.etterlevelse.kravprioritylist.dto.KravPriorityListResponse;

import java.util.Comparator;
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

    public Comparator<EtterlevelseMedKravData> comparator() {
        return (a, b) -> {
            int priorityIndexA = priorityList.indexOf(a.getEtterlevelseData().getKravNummer());
            int priorityIndexB = priorityList.indexOf(b.getEtterlevelseData().getKravNummer());

            if (priorityIndexA == -1) {
                priorityIndexA = 5000 - a.getEtterlevelseData().getKravNummer();
            }
            if (priorityIndexB == -1) {
                priorityIndexB = 5000 - b.getEtterlevelseData().getKravNummer();
            }

            if (priorityIndexA == priorityIndexB) {
                return b.getEtterlevelseData().getKravVersjon().compareTo(a.getEtterlevelseData().getKravVersjon());
            }

            return priorityIndexA - priorityIndexB;
        };
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
