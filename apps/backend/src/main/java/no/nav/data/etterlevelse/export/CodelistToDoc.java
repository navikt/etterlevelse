package no.nav.data.etterlevelse.export;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import org.docx4j.jaxb.Context;
import org.docx4j.model.table.TblFactory;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.FooterPart;
import org.docx4j.openpackaging.parts.WordprocessingML.MainDocumentPart;
import org.docx4j.wml.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.util.*;

import static no.nav.data.common.utils.StreamUtils.filter;

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


    class DocumentBuilder {

        public static final String TITLE = "Title";
        public static final String HEADING_1 = "Heading1";
        public static final String HEADING_2 = "Heading2";
        public static final String HEADING_4 = "Heading4";
        public static final String HEADING_5 = "Heading5";

        WordprocessingMLPackage pack;
        MainDocumentPart main;
        long listId = 1;
        long codelistId = 1;

        @SneakyThrows
        public DocumentBuilder() {
            pack = WordprocessingMLPackage.createPackage();
            main = pack.getMainDocumentPart();

            addFooter();
        }

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


        private RPr createRpr() {
            RPr rPr = fac.createRPr();
            CTLanguage ctLang = fac.createCTLanguage();
            ctLang.setVal("no-NB");
            rPr.setLang(ctLang);
            return rPr;
        }

        private void addTitle(String text) {
            P p = main.addStyledParagraphOfText(TITLE, text);
            ((R) p.getContent().get(0)).setRPr(createRpr());
        }

        private P addHeading1(String text) {
            P p = main.addStyledParagraphOfText(HEADING_1, text);
            ((R) p.getContent().get(0)).setRPr(createRpr());
            return p;
        }

        private void addHeading2(String text) {
            P p = main.addStyledParagraphOfText(HEADING_2, text);
            ((R) p.getContent().get(0)).setRPr(createRpr());
        }

        private void addHeading4(String text) {
            P p = main.addStyledParagraphOfText(HEADING_4, text);
            ((R) p.getContent().get(0)).setRPr(createRpr());
        }

        private void addHeading5(String text) {
            P p = main.addStyledParagraphOfText(HEADING_5, text);
            ((R) p.getContent().get(0)).setRPr(createRpr());
        }


        private Text text(String... values) {
            List<String> strings = filter(Arrays.asList(values), Objects::nonNull);
            if (strings.isEmpty()) {
                return null;
            }
            Text text = fac.createText();
            text.setValue(String.join("", strings).replaceAll("[\\s]+", " "));
            return text;
        }

        private P paragraph(Text... values) {
            return paragraph(Arrays.asList(values));
        }

        private P paragraph(Collection<Text> values) {
            var texts = filter(values, Objects::nonNull);
            P p = fac.createP();
            R r = fac.createR();
            r.setRPr(createRpr());
            for (int i = 0; i < texts.size(); i++) {
                Text txt = texts.get(i);
                r.getContent().add(txt);
                if (i != texts.size() - 1) {
                    r.getContent().add(fac.createBr());
                }
            }
            p.getContent().add(r);
            return p;
        }

        private void addTexts(Text... values) {
            addTexts(Arrays.asList(values));
        }

        private void addTexts(Collection<Text> values) {
            main.addObject(paragraph(values));
        }

        private void addText(Collection<String> values) {
            addText(String.join(", ", values));
        }

        private void addText(String... values) {
            main.addObject(paragraph(text(values)));
        }

        private void addToc(List<Codelist> codelists) {
            long currListId = listId++;

            for (Codelist codelist : codelists) {
                var name = codelist.getShortName();
                var bookmark = codelist.getCode();

                addListItem(name, currListId, bookmark);
            }
        }

        private void addListItem(String text, long listId, String bookmark) {
            var p = paragraph();
            PPr pPr = fac.createPPr();
            PPrBase.NumPr numPr = fac.createPPrBaseNumPr();
            PPrBase.NumPr.NumId numId = fac.createPPrBaseNumPrNumId();
            PPrBase.Spacing pPrBaseSpacing = fac.createPPrBaseSpacing();
            p.setPPr(pPr);
            pPr.setNumPr(numPr);

            // Remove spacing
            pPrBaseSpacing.setBefore(BigInteger.ZERO);
            pPrBaseSpacing.setAfter(BigInteger.ZERO);
            pPr.setSpacing(pPrBaseSpacing);

            numPr.setNumId(numId);
            numId.setVal(BigInteger.valueOf(listId));
            main.getContent().add(p);

            if (bookmark != null) {
                var h = MainDocumentPart.hyperlinkToBookmark(bookmark, text);
                p.getContent().add(h);
            } else {
                p.getContent().add(text(text));
            }
        }

        private void pageBreak() {
            P p = fac.createP();
            R r = fac.createR();
            Br br = fac.createBr();
            br.setType(STBrType.PAGE);
            p.getContent().add(r);
            r.getContent().add(br);
            main.getContent().add(p);
        }

        private Tbl createTable(int rows, int cols) {
            var twips = pack.getDocumentModel().getSections().get(0).getPageDimensions().getWritableWidthTwips();
            Tbl table = TblFactory.createTable(rows, cols, twips / cols);
            main.getContent().add(table);
            return table;
        }

        @SneakyThrows
        private void addFooter() {
            var p = fac.createP();
            var r = fac.createR();

            var rpr = createRpr();
            var size = new HpsMeasure();
            size.setVal(BigInteger.valueOf(16));
            rpr.setSz(size);
            rpr.setNoProof(new BooleanDefaultTrue());
            r.setRPr(rpr);

            var ppr = fac.createPPr();
            var jc = fac.createJc();
            jc.setVal(JcEnumeration.RIGHT);
            ppr.setJc(jc);
            p.setPPr(ppr);

            var pgnum = fac.createCTSimpleField();
            pgnum.setInstr(" PAGE \\* MERGEFORMAT ");
            var fldSimple = fac.createPFldSimple(pgnum);
            p.getContent().add(fldSimple);

            var footer = fac.createFtr();
            footer.getContent().add(p);

            var footerPart = new FooterPart();
            footerPart.setJaxbElement(footer);
            var ftrRel = main.addTargetPart(footerPart);
            pack.getParts().put(footerPart);

            var ftrRef = fac.createFooterReference();
            ftrRef.setId(ftrRel.getId());
            ftrRef.setType(HdrFtrRef.DEFAULT);
            var sectPr = pack.getDocumentModel().getSections().iterator().next().getSectPr();
            sectPr.getEGHdrFtrReferences().add(ftrRef);
        }

        private void addBookmark(P p, String name) {
            var id = BigInteger.valueOf(codelistId++);
            var size = p.getContent().size();

            // Add bookmark end first
            var mr = fac.createCTMarkupRange();
            mr.setId(id);
            var bmEnd = fac.createBodyBookmarkEnd(mr);
            p.getContent().add(size, bmEnd);

            // Next, bookmark start
            var bm = fac.createCTBookmark();
            bm.setId(id);
            bm.setName(name);
            var bmStart = fac.createBodyBookmarkStart(bm);
            p.getContent().add(0, bmStart);
        }


        @SneakyThrows
        public byte[] build() {
            var outStream = new ByteArrayOutputStream();
            pack.save(outStream);
            return outStream.toByteArray();
        }
    }
}


