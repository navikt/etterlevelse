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
    private Integer sistRedigert;

    public List<String> getRelevans() {
        return formatList(relevans);
    }

    public boolean isEmpty() {
        validate();
        return StringUtils.isBlank(id)
                && getRelevans().isEmpty()
                && sistRedigert == null
                ;
    }

    private void validate() {
        if (sistRedigert != null) {
            if (sistRedigert < 1) {
                sistRedigert = null;
            } else if (sistRedigert > 20) {
                sistRedigert = 20;
            }
        }
    }


}
