package no.nav.data.etterlevelse.behandling.dto;

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
public class BehandlingFilter {

    private List<String> relevans;

    public List<String> getRelevans() {
        return formatList(relevans);
    }

    public boolean isEmpty() {
        return getRelevans().isEmpty()
                ;
    }

}
