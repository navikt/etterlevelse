package no.nav.data.etterlevelse.codelist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.domain.ListName;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllCodelistResponse {

    private Map<ListName, List<CodelistResponse>> codelist;

}
