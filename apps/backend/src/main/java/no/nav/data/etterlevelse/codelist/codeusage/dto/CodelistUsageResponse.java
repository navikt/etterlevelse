package no.nav.data.etterlevelse.codelist.codeusage.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.domain.ListName;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"listName", "codesInUse"})
public class CodelistUsageResponse {

    private ListName listName;
    private List<CodeUsageResponse> codesInUse;

}
