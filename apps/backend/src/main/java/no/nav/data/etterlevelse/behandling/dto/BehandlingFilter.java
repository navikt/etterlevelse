package no.nav.data.etterlevelse.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

import static no.nav.data.common.utils.StringUtils.formatList;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BehandlingFilter {

    private String id;
    private List<String> relevans;

    public List<String> getRelevans() {
        return formatList(relevans);
    }

    public boolean isEmpty() {
        return StringUtils.isBlank(id) &&
                getRelevans().isEmpty()
                ;
    }

}
