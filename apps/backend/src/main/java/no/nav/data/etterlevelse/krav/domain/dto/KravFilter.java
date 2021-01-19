package no.nav.data.etterlevelse.krav.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import static no.nav.data.common.utils.StringUtils.formatList;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KravFilter {

    private List<String> relevans;
    private Integer nummer;
    private String behandlingId;
    private String underavdeling;

    public List<String> getRelevans() {
        return formatList(relevans);
    }

    public boolean isEmpty() {
        return getRelevans().isEmpty() &&
                nummer == null &&
                behandlingId == null &&
                underavdeling == null
                ;
    }

}
