package no.nav.data.etterlevelse.codelist.codeusage.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"listName", "code", "krav"})
public class CodeUsageResponse {

    private ListName listName;
    private String code;
    private String shortName;
    private boolean inUse;

    private List<InstanceId> krav = new ArrayList<>();
    private List<InstanceId> etterlevelseDokumentasjoner = new ArrayList<>();
    private List<InstanceId> virkemidler = new ArrayList<>();

    private List<CodelistResponse> codelist = new ArrayList<>();

    public CodeUsageResponse(ListName listName, String code, String shortName) {
        this.listName = listName;
        this.code = code;
        this.shortName = shortName;
    }

}
