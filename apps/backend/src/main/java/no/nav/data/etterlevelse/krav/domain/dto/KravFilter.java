package no.nav.data.etterlevelse.krav.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.exceptions.ValidationException;
import org.apache.commons.lang3.StringUtils;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KravFilter {

    private String relevans;
    private Integer nummer;

    public void validate() {
        if (isEmpty()) {
            throw new ValidationException("Empty filter");
        }
    }

    public boolean isEmpty() {
        return StringUtils.isEmpty(relevans) &&
                nummer == null
                ;
    }

}
