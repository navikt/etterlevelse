package no.nav.data.etterlevelse.export;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import org.docx4j.jaxb.Context;

import org.docx4j.wml.*;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
@RequiredArgsConstructor
public class CodelistToDoc {

    private static final ObjectFactory fac = Context.getWmlObjectFactory();

    public byte[] generateDocFor(ListName list) {
        List<Codelist> codelists;
        String title;
        switch (list) {
            case RELEVANS -> {
                title = "Relevans";
                codelists = CodelistService.getCodelist(ListName.RELEVANS);
            }
            case AVDELING -> {
                title = "Avdeling";
                codelists = CodelistService.getCodelist(ListName.AVDELING);
            }
            case UNDERAVDELING -> {
                title = "Underavdeling";
                codelists = CodelistService.getCodelist(ListName.UNDERAVDELING);
            }
            case LOV -> {
                title = "Lov";
                codelists = CodelistService.getCodelist(ListName.LOV);
            }
            case TEMA -> {
                title = "Tema";
                codelists = CodelistService.getCodelist(ListName.TEMA);
            }
            default -> throw new ValidationException("no list given");
        }

        codelists = new ArrayList<>(codelists);

        var doc = new DocumentBuilder();
        doc.addTitle(title);

        doc.addHeading1(String.format("Dokumentet inneholder følgende kodeverk", codelists.size()));
        doc.addToc(codelists);

        for (int i = 0; i < codelists.size(); i++) {
            if (i != codelists.size() - 1) {
                doc.pageBreak();
            }
            doc.generate(codelists.get(i));
        }

        return doc.build();
    }


    static class DocumentBuilder extends WordDocUtils {

        public DocumentBuilder () {
            super(fac);
        }

        long listId = 1;


        public void generate(Codelist codelist) {
            JsonNode codelistData = codelist.getData();
            String codelistName = codelist.getShortName();

            var header = addHeading1(codelistName);

            addBookmark(header, codelist.getCode());

            addHeading4("Beskrivelse");
            addText(codelist.getDescription());

            if(!codelistData.isEmpty()) {
                codelistData.fieldNames().forEachRemaining(d -> {
                    addHeading4(d);
                    addText(codelistData.get(d).toString());
                });
            }

        }

        public void addToc(List<Codelist> codelists) {
            long currListId = listId++;

            for (Codelist codelist : codelists) {
                var name = codelist.getShortName();
                var bookmark = codelist.getCode();

                addListItem(name, currListId, bookmark);
            }
        }
    }
}


