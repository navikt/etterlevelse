package no.nav.data.etterlevelse.common.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExternalCode {

    private String list;
    private String code;
    private String shortName;
    private String description;
    @Default
    private boolean external = true;

}
