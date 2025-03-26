package no.nav.data.pvk.pvotilbakemelding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PvoTilbakemeldingFilter {

    private String id;
    private Integer sistRedigert;

    public boolean isEmpty() {
        validate();
        return StringUtils.isBlank(id)
                && sistRedigert == null;
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
