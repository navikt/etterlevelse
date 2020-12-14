package no.nav.data.etterlevelse.codelist.codeusage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.codelist.domain.ListName;

import java.util.ArrayList;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeUsage {

    private ListName listName;
    private String code;
    private List<GenericStorage> krav = new ArrayList<>();
    private List<GenericStorage> behandlinger = new ArrayList<>();

    public CodeUsage(ListName listName, String code) {
        this.listName = listName;
        this.code = code;
    }

    public boolean isInUse() {
        return !krav.isEmpty();
    }

    public CodeUsageResponse convertToResponse() {
        CodeUsageResponse response = new CodeUsageResponse(listName, code);
        response.setKrav(convert(krav, k -> k.toKrav().convertToInstanceId()));
        response.setBehandlinger(convert(behandlinger, k -> k.toBehandlingData().convertToInstanceId()));
        return response;
    }
}
