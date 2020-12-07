package no.nav.data.integration.behandling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.common.domain.ExternalCode;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BkatCode {

    private String list;
    private String code;
    private String shortName;
    private String description;

    public ExternalCode convertToCode() {
        return ExternalCode.builder()
                .list(list)
                .code(code)
                .shortName(shortName)
                .description(description)
                .build();
    }

    public static ExternalCode toCode(BkatCode bkatCode) {
        return bkatCode == null ? null : bkatCode.convertToCode();
    }
}
