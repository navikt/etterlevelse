package no.nav.data.etterlevelse.codelist.codeusage.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.etterlevelse.codelist.domain.ListName;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"listName", "code", "krav"})
public class CodeUsageResponse {

    private ListName listName;
    private String code;
    private List<InstanceId> krav = new ArrayList<>();
    private List<InstanceId> behandlinger = new ArrayList<>();

    public CodeUsageResponse(ListName listName, String code) {
        this.listName = listName;
        this.code = code;
    }

    public boolean isInUse() {
        return !krav.isEmpty();
    }
}
