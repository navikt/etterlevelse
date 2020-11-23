package no.nav.data.etterlevelse.codelist;

import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;

public class CodelistStub {

    public static void initializeCodelist() {
        CodelistCache.init();
        add(ListName.RELEVANS, "SAK", "Sak", "Saken");
        add(ListName.RELEVANS, "INNSYN", "Innsyn", "Inns");
    }

    private static void add(ListName source, String code, String name, String desc) {
        CodelistCache.set(create(source, code, name, desc));
    }

    private static Codelist create(ListName list, String code, String name, String description) {
        return Codelist.builder().list(list).code(code).shortName(name).description(description).build();
    }
}
