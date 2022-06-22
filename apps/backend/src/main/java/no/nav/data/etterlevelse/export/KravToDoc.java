package no.nav.data.etterlevelse.export;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KravToDoc {

    private static final ObjectFactory fac = Context.getWmlObjectFactory();
    private final KravService kravService;

    public byte[] generateDocFor(ListName list, List<String> codes) {
        List<Krav> kravList;
        String title;
        switch (list) {
            case RELEVANS -> {
                title = "Krav filtrert med Relevans";
                kravList = kravService.getByFilter(KravFilter.builder().relevans(codes).build());
            }
            case UNDERAVDELING -> {
                title = "Krav filtrert med Underavdeling";
                kravList = kravService.getByFilter(KravFilter.builder().underavdeling(codes.get(0)).build());
            }
            case LOV -> {
                title = "Krav filtrert med lov";
                kravList = kravService.getByFilter(KravFilter.builder().lov(codes.get(0)).build());
            }
            case TEMA -> {
                title = "Krav filtrert med tema";
                kravList = kravService.getByFilter(KravFilter.builder().lover(codes).build());
            }
            default -> throw new ValidationException("no list given");
        }

        kravList = new ArrayList<>(kravList);

        var doc = new DocumentBuilder();
        doc.addTitle(title);

        doc.addHeading1(String.format("Dokumentet inneholder følgende krav", kravList.size()));
        doc.addToc(kravList);

        for (int i = 0; i < kravList.size(); i++) {
            if (i != kravList.size() - 1) {
                doc.pageBreak();
            }
            doc.generate(kravList.get(i));
        }

        return doc.build();
    }


    static class DocumentBuilder extends WordDocUtils {

        public DocumentBuilder () {
            super(fac);
        }

        long listId = 1;


        public void generate(Krav krav) {
            String kravName = "K" + krav.getKravNummer() + "." + krav.getKravVersjon() + " - " + krav.getNavn();

            var header = addHeading1(kravName);

            addBookmark(header, krav.getId().toString());

        }

        public void addToc(List<Krav> kravList) {

            long currListId = listId++;

            for (Krav krav : kravList) {
                var name = "K" + krav.getKravNummer() + "." + krav.getKravVersjon() + " - " + krav.getNavn();
                var bookmark = krav.getId().toString();

                addListItem(name, currListId, bookmark);
            }
        }
    }
}
