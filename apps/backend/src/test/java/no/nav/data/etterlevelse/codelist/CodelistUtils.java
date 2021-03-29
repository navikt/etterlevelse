package no.nav.data.etterlevelse.codelist;


import no.nav.data.common.utils.JsonUtils;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.codelist.dto.CodelistRequest;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class CodelistUtils {

    public static Codelist createCodelist() {
        return createCodelist(ListName.RELEVANS, "CODE", "shortName", "description");
    }

    public static Codelist createCodelist(ListName listName) {
        return createCodelist(listName, "CODE", "shortName", "description");
    }

    public static Codelist createCodelist(ListName listName, String code) {
        return createCodelist(listName, code, "shortName", "description");
    }

    public static Codelist createCodelist(ListName listName, String code, String shortName, String description) {
        return Codelist.builder()
                .list(listName)
                .code(code)
                .shortName(shortName)
                .description(description)
                .build();
    }

    public static CodelistRequest createCodelistRequest() {
        return createCodelistRequest(ListName.RELEVANS.name(), "CODE", "shortName", "description");
    }

    public static CodelistRequest createCodelistRequest(String listName) {
        return createCodelistRequest(listName, "CODE", "shortName", "description");
    }

    public static CodelistRequest createCodelistRequest(String listName, String code, Map<String, String> dataFields) {
        var req = createCodelistRequest(listName, code);
        req.setData(JsonUtils.toJsonNode(dataFields));
        return req;
    }

    public static CodelistRequest createCodelistRequest(String listName, String code) {
        return createCodelistRequest(listName, code, code + "-shortName", "description");
    }

    public static CodelistRequest createCodelistRequest(String listName, String code, String shortName, String description) {
        return CodelistRequest.builder()
                .list(listName)
                .code(code)
                .shortName(shortName)
                .description(description)
                .build();
    }

    public static List<CodelistRequest> createNrOfCodelistRequests(int nrOfRequests) {
        return IntStream.rangeClosed(1, nrOfRequests).mapToObj(i -> createCodelistRequest(ListName.RELEVANS.name(), "CODE_NR_" + i)).collect(Collectors.toList());
    }
}
