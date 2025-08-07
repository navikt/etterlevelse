package no.nav.data.etterlevelse.codelist;

import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;

public class CodelistStub {

    public static void initializeCodelist() {
        CodelistCache.init();
        add(ListName.RELEVANS, "SAK", "Sak");
        add(ListName.RELEVANS, "INNSYN", "Innsyn");
        add(ListName.AVDELING, "AVDELING", "Avdeling");
        add(ListName.UNDERAVDELING, "UNDERAVDELING", "Underavdeling");
        add(ListName.LOV, "ARKIV", "Arkivloven");
        add(ListName.TEMA, "PERSONVERN", "Personvern");
        add(ListName.YTTERLIGERE_EGENSKAPER, "PROFILERING", "Profilering");
        add(ListName.YTTERLIGERE_EGENSKAPER, "TEKNOLOGI", "Bruk av teknologi");
        add(ListName.PVO_VURDERING, "IKKEBRA", "Ikke bra nok");
        add(ListName.PVO_VURDERING, "BRA", "Bra");

    }

    private static void add(ListName source, String code, String name) {
        CodelistCache.set(create(source, code, name));
    }

    private static Codelist create(ListName list, String code, String name) {
        return Codelist.builder().list(list).code(code).shortName(name).description("description").build();
    }
}
