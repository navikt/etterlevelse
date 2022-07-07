package no.nav.data.common.utils;

import com.vladsch.flexmark.ext.definition.DefinitionExtension;
import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughSubscriptExtension;
import com.vladsch.flexmark.ext.ins.InsExtension;
import com.vladsch.flexmark.ext.superscript.SuperscriptExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.ext.toc.SimTocExtension;
import com.vladsch.flexmark.ext.toc.TocExtension;
import lombok.SneakyThrows;
import org.apache.commons.lang3.BooleanUtils;
import org.docx4j.model.table.TblFactory;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.FooterPart;
import org.docx4j.openpackaging.parts.WordprocessingML.MainDocumentPart;
import org.docx4j.wml.*;
import com.vladsch.flexmark.util.data.MutableDataSet;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.docx.converter.DocxRenderer;

import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import static no.nav.data.common.utils.StreamUtils.filter;

public class WordDocUtils {

    private final ObjectFactory fac;
    private final MutableDataSet options = new MutableDataSet().set(Parser.EXTENSIONS, Arrays.asList(
            DefinitionExtension.create(),
            StrikethroughSubscriptExtension.create(),
            InsExtension.create(),
            SuperscriptExtension.create(),
            TablesExtension.create(),
            TocExtension.create(),
            SimTocExtension.create()
    ))
            .set(DocxRenderer.SUPPRESS_HTML, true)
            // the following two are needed to allow doc relative and site relative address resolution
            .set(DocxRenderer.DOC_RELATIVE_URL, "file:///Users/vlad/src/pdf") // this will be used for URLs like 'images/...' or './' or '../'
            .set(DocxRenderer.DOC_ROOT_URL, "file:///Users/vlad/src/pdf") // this will be used for URLs like: '/...'
            ;

    private final DocxRenderer docxRenderer = DocxRenderer.builder(options).build();
    private final Parser markdownParser = Parser.builder(options).build();

    @SneakyThrows
    public WordDocUtils(ObjectFactory fac) {
        this.fac = fac;


        pack = WordprocessingMLPackage.createPackage();
        main = pack.getMainDocumentPart();

        addFooter();
    }


    public static final String TITLE = "Title";
    public static final String HEADING_1 = "Heading1";
    public static final String HEADING_2 = "Heading2";
    public static final String HEADING_4 = "Heading4";
    public static final String HEADING_5 = "Heading5";

    WordprocessingMLPackage pack;
    MainDocumentPart main;

    long bookmarkId = 1;

    public RPr createRpr() {
        RPr rPr = fac.createRPr();
        CTLanguage ctLang = fac.createCTLanguage();
        ctLang.setVal("no-NB");
        rPr.setLang(ctLang);
        return rPr;
    }

    public void addTitle(String text) {
        P p = main.addStyledParagraphOfText(TITLE, text);
        ((R) p.getContent().get(0)).setRPr(createRpr());
    }

    public P addHeading1(String text) {
        P p = main.addStyledParagraphOfText(HEADING_1, text);
        ((R) p.getContent().get(0)).setRPr(createRpr());
        return p;
    }

    public void addHeading2(String text) {
        P p = main.addStyledParagraphOfText(HEADING_2, text);
        ((R) p.getContent().get(0)).setRPr(createRpr());
    }

    public void addHeading4(String text) {
        P p = main.addStyledParagraphOfText(HEADING_4, text);
        ((R) p.getContent().get(0)).setRPr(createRpr());
    }

    public void addHeading5(String text) {
        P p = main.addStyledParagraphOfText(HEADING_5, text);
        ((R) p.getContent().get(0)).setRPr(createRpr());
    }


    public Text text(String... values) {
        List<String> strings = filter(Arrays.asList(values), Objects::nonNull);
        if (strings.isEmpty()) {
            return null;
        }
        Text text = fac.createText();
        text.setValue(String.join("", strings).replaceAll("[\\s]+", " "));
        return text;
    }

    public P paragraph(Text... values) {
        return paragraph(Arrays.asList(values));
    }

    public P paragraph(Collection<Text> values) {
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

    public void addMarkdownText(String text) {
        var markdownText = markdownParser.parse(text);

        docxRenderer.render(markdownText, pack);

    }

    public void addTexts(Text... values) {
        addTexts(Arrays.asList(values));
    }

    public void addTexts(Collection<Text> values) {
        main.addObject(paragraph(values));
    }

    public void addText(Collection<String> values) {
        addText(String.join(", ", values));
    }

    public void addText(String... values) {
        main.addObject(paragraph(text(values)));
    }

    public void addListItem(String text, long listId, String bookmark) {
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

    public void pageBreak() {
        P p = fac.createP();
        R r = fac.createR();
        Br br = fac.createBr();
        br.setType(STBrType.PAGE);
        p.getContent().add(r);
        r.getContent().add(br);
        main.getContent().add(p);
    }

    public Tbl createTable(int rows, int cols) {
        var twips = pack.getDocumentModel().getSections().get(0).getPageDimensions().getWritableWidthTwips();
        Tbl table = TblFactory.createTable(rows, cols, twips / cols);
        main.getContent().add(table);
        return table;
    }

    @SneakyThrows
    public void addFooter() {
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

    public void addBookmark(P p, String name) {
        var id = BigInteger.valueOf(bookmarkId++);
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

    public String boolToText(Boolean aBoolean) {
        return BooleanUtils.toString(aBoolean, "Ja", "Nei", "Uavklart");
    }

    @SneakyThrows
    public byte[] build() {
        var outStream = new ByteArrayOutputStream();
        pack.save(outStream);
        return outStream.toByteArray();
    }
}
