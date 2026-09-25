package no.nav.data.common.utils;

import static no.nav.data.common.utils.StreamUtils.filter;

import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.commons.lang3.BooleanUtils;
import org.docx4j.model.table.TblFactory;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.FooterPart;
import org.docx4j.openpackaging.parts.WordprocessingML.MainDocumentPart;
import org.docx4j.openpackaging.parts.relationships.Namespaces;
import org.docx4j.relationships.Relationship;
import org.docx4j.wml.BooleanDefaultTrue;
import org.docx4j.wml.Br;
import org.docx4j.wml.CTBorder;
import org.docx4j.wml.CTLanguage;
import org.docx4j.wml.Color;
import org.docx4j.wml.HdrFtrRef;
import org.docx4j.wml.HpsMeasure;
import org.docx4j.wml.JcEnumeration;
import org.docx4j.wml.ObjectFactory;
import org.docx4j.wml.P;
import org.docx4j.wml.PPr;
import org.docx4j.wml.PPrBase;
import org.docx4j.wml.R;
import org.docx4j.wml.RFonts;
import org.docx4j.wml.RPr;
import org.docx4j.wml.RStyle;
import org.docx4j.wml.STBrType;
import org.docx4j.wml.Styles;
import org.docx4j.wml.Tbl;
import org.docx4j.wml.Text;

import com.vladsch.flexmark.ast.AutoLink;
import com.vladsch.flexmark.ast.BulletList;
import com.vladsch.flexmark.ast.Code;
import com.vladsch.flexmark.ast.Emphasis;
import com.vladsch.flexmark.ast.FencedCodeBlock;
import com.vladsch.flexmark.ast.HardLineBreak;
import com.vladsch.flexmark.ast.Heading;
import com.vladsch.flexmark.ast.HtmlInline;
import com.vladsch.flexmark.ast.IndentedCodeBlock;
import com.vladsch.flexmark.ast.Link;
import com.vladsch.flexmark.ast.OrderedList;
import com.vladsch.flexmark.ast.Paragraph;
import com.vladsch.flexmark.ast.SoftLineBreak;
import com.vladsch.flexmark.ast.StrongEmphasis;
import com.vladsch.flexmark.ext.definition.DefinitionExtension;
import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughSubscriptExtension;
import com.vladsch.flexmark.ext.ins.InsExtension;
import com.vladsch.flexmark.ext.superscript.SuperscriptExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.ext.toc.SimTocExtension;
import com.vladsch.flexmark.ext.toc.TocExtension;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.util.data.MutableDataSet;

import lombok.SneakyThrows;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.common.domain.ExternalCode;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.behandling.dto.DataBehandler;
import no.nav.data.integration.behandling.dto.PolicyResponse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.dto.TeamResponse;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfang;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.Tilbakemeldingsinnhold;
import no.nav.data.pvk.pvotilbakemelding.domain.TilhorendeDokumentasjonTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.Vurdering;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import no.nav.data.pvk.tiltak.dto.TiltakResponse;

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
    ));

    private static final String TEMPLATE = "/export/word-template.docx";
    private static final long BULLET_NUM_ID = 2;
    private static final long ORDERED_NUM_ID = 3;

    private final Parser markdownParser = Parser.builder(options).build();

    @SneakyThrows
    public WordDocUtils(ObjectFactory fac) {
        this.fac = fac;
        pack = WordprocessingMLPackage.load(WordDocUtils.class.getResourceAsStream(TEMPLATE));
        main = pack.getMainDocumentPart();

        Styles styles = main.getStyleDefinitionsPart().getJaxbElement();

        styles.getStyle().forEach(style -> {
            RPr rpr = style.getRPr();
            if (rpr == null) {
                rpr = createRpr();
               style.setRPr(rpr);
            }
            RFonts rfonts = rpr.getRFonts();
            if (rfonts == null) {
                rfonts = getRFonts();
            }
            rfonts.setAscii(FONT_FAMILY);
        });

        addFooter();
    }


    public static final String TITLE = "Title";
    public static final String SUBTITLE = "Subtitle";
    public static final String HEADING_1 = "Heading1";
    public static final String HEADING_2 = "Heading2";
    public static final String HEADING_3 = "Heading3";
    public static final String HEADING_4 = "Heading4";
    public static final String HEADING_5 = "Heading5";
    public static final String HEADING_6 = "Heading6";
    public static final String FONT_FAMILY = "Source Sans Pro";
    public static final String FONT_STYLE = "SemiBold";

    WordprocessingMLPackage pack;
    MainDocumentPart main;

    long bookmarkId = 1;

    public void setRprFontSize(RPr rPr, int size) {
        HpsMeasure szValue = fac.createHpsMeasure();

        //pixel size is half the value of size. ex.: size=50, pixelSize=25
        // in order to have a better flow when using the method pixelValue is set to size * 2 for easier use of method
        long pixelValue = size * 2L;
        szValue.setVal(BigInteger.valueOf(pixelValue));
        rPr.setSz(szValue);
    }

    public void setRprFontColor(RPr rPr, String color) {
        Color fontColor = fac.createColor();
        fontColor.setVal(color);
        rPr.setColor(fontColor);
    }

    public void setRprFontBold(RPr rPr, boolean isBold) {
        BooleanDefaultTrue boldValue = new BooleanDefaultTrue();
        boldValue.setVal(isBold);
        rPr.setB(boldValue);
    }

    public void setRprFontFamilyAndStyle(RPr rPr) {
        RFonts rFonts = getRFonts();
        rFonts.setAscii(FONT_FAMILY + " " + FONT_STYLE);
        rPr.setRFonts(rFonts);
    }

    public RPr createRpr() {
        RPr rPr = fac.createRPr();
        CTLanguage ctLang = fac.createCTLanguage();
        ctLang.setVal("no-NB");
        rPr.setLang(ctLang);
        return rPr;
    }

    public RFonts getRFonts() {
        RFonts rFonts = new RFonts();
        rFonts.setAscii(FONT_FAMILY);
        return rFonts;
    }

    public void addTitle(String text) {
        P p = main.addStyledParagraphOfText(TITLE, text);
        ((R) p.getContent().get(0)).setRPr(createRpr());
    }

    public void addSubtitle(String text){
        P p = main.addStyledParagraphOfText(SUBTITLE,text);
        RPr rPr = createRpr();
        setRprFontColor(rPr, "000000");
        ((R) p.getContent().get(0)).setRPr(rPr);
    }

    public P addHeading1(String text) {
        P p = main.addStyledParagraphOfText(HEADING_1, text);
        RPr rPr = createRpr();
        setRprFontSize(rPr, 24);
        setRprFontFamilyAndStyle(rPr);
        ((R) p.getContent().get(0)).setRPr(rPr);


        PPrBase.PBdr bdr = fac.createPPrBasePBdr();
        CTBorder bottom = fac.createCTBorder();
        p.getPPr().setPBdr(bdr);
        bdr.setBottom(bottom);
        bottom.setVal(org.docx4j.wml.STBorder.SINGLE);
        bottom.setSz(new java.math.BigInteger("6"));
        bottom.setSpace(new java.math.BigInteger("1"));

        return p;
    }

    public P addHeading2(String text) {
        P p = main.addStyledParagraphOfText(HEADING_2, text);
        RPr rPr = createRpr();
        setRprFontSize(rPr, 20);
        setRprFontFamilyAndStyle(rPr);
        ((R) p.getContent().get(0)).setRPr(rPr);
        return p;
    }

    public P addHeading3(String text) {
        P p = main.addStyledParagraphOfText(HEADING_3, text);
        RPr rPr = createRpr();
        setRprFontSize(rPr, 16);
        setRprFontFamilyAndStyle(rPr);
        ((R) p.getContent().get(0)).setRPr(rPr);
        return p;
    }

    public void addHeading4(String text) {
        P p = main.addStyledParagraphOfText(HEADING_4, text);
        RPr rPr = createRpr();
        setRprFontSize(rPr, 14);
        setRprFontFamilyAndStyle(rPr);
        ((R) p.getContent().get(0)).setRPr(rPr);
    }

    public void addHeading5(String text) {
        P p = main.addStyledParagraphOfText(HEADING_5, text);
        RPr rPr = createRpr();
        setRprFontSize(rPr, 14);
        setRprFontBold(rPr, false);
        ((R) p.getContent().get(0)).setRPr(rPr);
    }

    public void addHeading6(String text) {
        P p = main.addStyledParagraphOfText(HEADING_6, text);
        RPr rPr = createRpr();
        setRprFontSize(rPr, 12);
        setRprFontBold(rPr, false);
        ((R) p.getContent().get(0)).setRPr(rPr);
    }

    public void addLabel(String text) {
        addMarkdownText("**" + text + "**");
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
        if (text == null) {
            return;
        }
        Node document = markdownParser.parse(text);
        for (Node block = document.getFirstChild(); block != null; block = block.getNext()) {
            renderBlock(block);
        }
    }

    private void renderBlock(Node node) {
        if (node instanceof Heading heading) {
            P p = fac.createP();
            setPStyle(p, "Heading" + Math.min(Math.max(heading.getLevel(), 1), 6));
            renderInlines(p, heading, false, false);
            main.getContent().add(p);
        } else if (node instanceof BulletList || node instanceof OrderedList) {
            boolean ordered = node instanceof OrderedList;
            for (Node item = node.getFirstChild(); item != null; item = item.getNext()) {
                renderListItem(item, ordered);
            }
        } else if (node instanceof FencedCodeBlock || node instanceof IndentedCodeBlock) {
            P p = fac.createP();
            addRun(p, node.getChars().toString(), false, false);
            main.getContent().add(p);
        } else if (node instanceof Paragraph) {
            P p = fac.createP();
            renderInlines(p, node, false, false);
            main.getContent().add(p);
        } else if (node.hasChildren()) {
            for (Node child = node.getFirstChild(); child != null; child = child.getNext()) {
                renderBlock(child);
            }
        } else {
            P p = fac.createP();
            addRun(p, node.getChars().toString(), false, false);
            main.getContent().add(p);
        }
    }

    private void renderListItem(Node item, boolean ordered) {
        P p = fac.createP();
        PPr pPr = fac.createPPr();
        setPStyleOn(pPr, ordered ? "ListNumber" : "ListBullet");
        PPrBase.NumPr numPr = fac.createPPrBaseNumPr();
        PPrBase.NumPr.NumId numId = fac.createPPrBaseNumPrNumId();
        numId.setVal(BigInteger.valueOf(ordered ? ORDERED_NUM_ID : BULLET_NUM_ID));
        PPrBase.NumPr.Ilvl ilvl = fac.createPPrBaseNumPrIlvl();
        ilvl.setVal(BigInteger.ZERO);
        numPr.setNumId(numId);
        numPr.setIlvl(ilvl);
        pPr.setNumPr(numPr);
        p.setPPr(pPr);

        for (Node child = item.getFirstChild(); child != null; child = child.getNext()) {
            if (child instanceof BulletList || child instanceof OrderedList) {
                main.getContent().add(p);
                renderBlock(child);
                p = null;
            } else if (child instanceof Paragraph) {
                renderInlines(p, child, false, false);
            } else {
                renderInlines(p, child, false, false);
            }
        }
        if (p != null) {
            main.getContent().add(p);
        }
    }

    private void renderInlines(P p, Node parent, boolean bold, boolean italic) {
        for (Node node = parent.getFirstChild(); node != null; node = node.getNext()) {
            if (node instanceof StrongEmphasis) {
                renderInlines(p, node, true, italic);
            } else if (node instanceof Emphasis) {
                renderInlines(p, node, bold, true);
            } else if (node instanceof Link link) {
                addHyperlink(p, link.getUrl().toString(), collectText(link));
            } else if (node instanceof AutoLink autoLink) {
                addHyperlink(p, autoLink.getUrl().toString(), autoLink.getUrl().toString());
            } else if (node instanceof Code) {
                addRun(p, node.getFirstChild() != null ? node.getFirstChild().getChars().toString() : "", bold, italic);
            } else if (node instanceof SoftLineBreak) {
                addRun(p, " ", bold, italic);
            } else if (node instanceof HardLineBreak) {
                addBreak(p);
            } else if (node instanceof HtmlInline) {
                if (node.getChars().toString().replaceAll("\\s", "").matches("(?i)<br/?>")) {
                    addBreak(p);
                }
            } else if (node instanceof com.vladsch.flexmark.ast.Text) {
                if (node.hasChildren()) {
                    renderInlines(p, node, bold, italic);
                } else {
                    addRun(p, node.getChars().unescape(), bold, italic);
                }
            } else if (node.hasChildren()) {
                renderInlines(p, node, bold, italic);
            } else {
                addRun(p, node.getChars().unescape(), bold, italic);
            }
        }
    }

    private String collectText(Node parent) {
        StringBuilder sb = new StringBuilder();
        for (Node node = parent.getFirstChild(); node != null; node = node.getNext()) {
            if (node.hasChildren()) {
                sb.append(collectText(node));
            } else {
                sb.append(node.getChars().unescape());
            }
        }
        return sb.toString();
    }

    private void addRun(P p, String value, boolean bold, boolean italic) {
        if (value == null || value.isEmpty()) {
            return;
        }
        R r = fac.createR();
        RPr rpr = createRpr();
        if (bold) {
            setRprFontBold(rpr, true);
        }
        if (italic) {
            BooleanDefaultTrue i = new BooleanDefaultTrue();
            i.setVal(true);
            rpr.setI(i);
        }
        r.setRPr(rpr);
        Text t = fac.createText();
        t.setValue(value);
        t.setSpace("preserve");
        r.getContent().add(t);
        p.getContent().add(r);
    }

    private void addBreak(P p) {
        R r = fac.createR();
        r.getContent().add(fac.createBr());
        p.getContent().add(r);
    }

    @SneakyThrows
    private void addHyperlink(P p, String url, String linkText) {
        Relationship rel = new org.docx4j.relationships.ObjectFactory().createRelationship();
        rel.setType(Namespaces.HYPERLINK);
        rel.setTarget(url.trim());
        rel.setTargetMode("External");
        main.getRelationshipsPart().addRelationship(rel);

        P.Hyperlink hyperlink = fac.createPHyperlink();
        hyperlink.setId(rel.getId());
        R r = fac.createR();
        RPr rpr = createRpr();
        RStyle rStyle = fac.createRStyle();
        rStyle.setVal("Hyperlink");
        rpr.setRStyle(rStyle);
        r.setRPr(rpr);
        Text t = fac.createText();
        t.setValue(linkText == null || linkText.isEmpty() ? url : linkText);
        t.setSpace("preserve");
        r.getContent().add(t);
        hyperlink.getContent().add(r);
        p.getContent().add(hyperlink);
    }

    private void setPStyle(P p, String styleId) {
        PPr pPr = p.getPPr() != null ? p.getPPr() : fac.createPPr();
        setPStyleOn(pPr, styleId);
        p.setPPr(pPr);
    }

    private void setPStyleOn(PPr pPr, String styleId) {
        PPrBase.PStyle pStyle = fac.createPPrBasePStyle();
        pStyle.setVal(styleId);
        pPr.setPStyle(pStyle);
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

    public void newLine() {
        addText("\n");
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

    public String adresseTypeText(AdresseType type) {
        return switch (type) {
            case EPOST -> "Epost";
            case SLACK -> "Slack kanal";
            case SLACK_USER -> "Slack bruker";
        };
    }

    public void addLastEditedBy(ChangeStamp changeStamp) {
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            String date = changeStamp.getLastModifiedDate().format(dateTimeFormatter);
            addText("Sist endret: " + date + " av " + changeStamp.getLastModifiedBy().split(" - ")[1]);
    }

    @SneakyThrows
    public byte[] build() {
        var outStream = new ByteArrayOutputStream();
        pack.save(outStream);
        return outStream.toByteArray();
    }

    //PVK docu
    public void generateBehandlingensArtOgOmfang(BehandlingensArtOgOmfang artOgOmfang, List<Behandling> behandlingList, PvoTilbakemelding pvoTilbakemelding, Vurdering pvoVudering) {
        newLine();
        var header2 = addHeading2("Behandlingens art og omfang");
        addBookmark(header2, "pvk_art_og_omfang");
        newLine();
        addPersonkategoriList(behandlingList);
        newLine();
        addBooleanDataText("Stemmer denne lista over personkategorier?", artOgOmfang.getBehandlingensArtOgOmfangData().getStemmerPersonkategorier());
        newLine();
        addDataText("For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om.", artOgOmfang.getBehandlingensArtOgOmfangData().getPersonkategoriAntallBeskrivelse());
        newLine();
        addDataText("Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang.", artOgOmfang.getBehandlingensArtOgOmfangData().getTilgangsBeskrivelsePersonopplysningene());
        newLine();
        addDataText("Beskriv hvordan og hvor lenge personopplysningene skal lagres.", artOgOmfang.getBehandlingensArtOgOmfangData().getLagringsBeskrivelsePersonopplysningene());
        newLine();

        if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
            generatePvoTilbakemelding(pvoVudering.getBehandlingensArtOgOmfang());
        }
    }

    public void generateTilhorendeDokumentasjon(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, long antallPvkKrav, long antallFerdigPvkKrav,PvoTilbakemelding pvoTilbakemelding, Vurdering pvoVudering) {
        newLine();
        var header2 = addHeading2("Tilhorende dokumentasjon");
        addBookmark(header2, "pvk_tilhorende_dokumentasjon");
        newLine();

        //Behandling
        addHeading3("Behandlinger i Behandlingskatalogen");
        newLine();
        addText("Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:");
        newLine();
        if(etterlevelseDokumentasjon.getBehandlinger().isEmpty()){
            addMarkdownText("- Ingen behandlinger");
        } else {
            etterlevelseDokumentasjon.getBehandlinger().forEach(behandling -> {
                addMarkdownText("- B" +  behandling.getNummer() + " " + behandling.getOverordnetFormaal().getShortName() + ": " + behandling.getNavn());
            });
        }
        newLine();

        //krav
        addHeading3("PVK-relaterte etterlevelseskrav");
        addText("Personvernkonsekvensvurdering forutsetter at dere har dokumentert etterlevelse ved alle personvernkrav. Så langt har dere:");
        addMarkdownText("- " + antallFerdigPvkKrav + " av " + antallPvkKrav + " krav er ferdig utfylt.");
        newLine();

        //ROS
        addHeading3("Risiko- og sårbarhetsvurdering (ROS)");
        addText("Dersom dere har gjennomført en eller flere risikovurderinger, skal disse legges ved etterlevelsesdokumentasjonen.");
        newLine();
        addText("Dere har koblet følgende dokumenter på dette dokumentet:");
        if(etterlevelseDokumentasjon.getRisikovurderinger() == null || etterlevelseDokumentasjon.getRisikovurderinger().isEmpty()){
            addMarkdownText("- Ingen dokumenter");
        } else {
            etterlevelseDokumentasjon.getRisikovurderinger().forEach(risikovurdering -> {
                addMarkdownText("- " + risikovurdering);
            });
        }
        newLine();

        //tilbakemelding
        addHeading3("Tilbakemelding fra Personvernombudet");
        newLine();

        generateTilbakemeldingForTilhorendeDokumentasjon(pvoTilbakemelding, pvoVudering);
    }

    private void generateTilbakemeldingForTilhorendeDokumentasjon(PvoTilbakemelding pvoTilbakemelding, Vurdering pvoVudering) {
        if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
            TilhorendeDokumentasjonTilbakemelding tilbakemelding = pvoVudering.getTilhorendeDokumentasjon();

            addHeading3("Behandlinger i Behandlingskatalogen");
            addLabel("Vurdér om dokumentasjon i Behandlingskatalogen er tilstrekkelig.");
            if (tilbakemelding != null) {
                addText(vurderingsBidragToText(tilbakemelding.getBehandlingskatalogDokumentasjonTilstrekkelig()));
            } else {
                addText("Ingen vurdering");
            }
            newLine();
            addLabel("Tilbakemelding");
            if (tilbakemelding != null && tilbakemelding.getBehandlingskatalogDokumentasjonTilbakemelding() != null && !tilbakemelding.getBehandlingskatalogDokumentasjonTilbakemelding().isBlank()) {
                addMarkdownText(tilbakemelding.getBehandlingskatalogDokumentasjonTilbakemelding());
            } else {
                addText("Ingen tilbakemelding");
            }
            newLine();

            addHeading3("PVK-relaterte etterlevelseskrav");
            addLabel("Vurdering om kravdokumentasjon er tilstrekkelig.");
            if (tilbakemelding != null) {
                addText(vurderingsBidragToText(tilbakemelding.getKravDokumentasjonTilstrekkelig()));

            } else {
                addText("Ingen vurdering");
            }
            newLine();
            addLabel("Tilbakemelding");
            if (tilbakemelding != null && tilbakemelding.getKravDokumentasjonTilbakemelding() != null && !tilbakemelding.getKravDokumentasjonTilbakemelding().isBlank()) {
                addMarkdownText(tilbakemelding.getKravDokumentasjonTilbakemelding());
            } else {
                addText("Ingen tilbakemelding");
            }
            newLine();

            addHeading3("Risiko- og sårbarhetsvurdering (ROS)");
            addLabel("Vurdering om risikovurderingen(e) er tilstrekkelig.");
            if (tilbakemelding != null) {
                addText(vurderingsBidragToText(tilbakemelding.getRisikovurderingTilstrekkelig()));
            } else {
                addText("Ingen vurdering");
            }
            newLine();
            addLabel("Tilbakemelding");
            if (tilbakemelding != null && tilbakemelding.getRisikovurderingTilbakemelding() != null && !tilbakemelding.getRisikovurderingTilbakemelding().isBlank()) {
                addMarkdownText(tilbakemelding.getRisikovurderingTilbakemelding());
            } else {
                addText("Ingen tilbakemelding");
            }
        }

    }

    public void generateInnvolveringAvEksterne(PvkDokument pvkDokument, List<Behandling> behandlingList, PvoTilbakemelding pvoTilbakemelding, Vurdering pvoVudering) {
        newLine();
        var header2 = addHeading2("Innvolvering av eksterne");
        addBookmark(header2, "pvk_innvolvering_av_ekstern");

        newLine();
        addHeading3("Representanter for de registrerte");
        addPersonkategoriList(behandlingList);
        newLine();
        addBooleanDataText("Har dere involvert en representant for de registrerte?", pvkDokument.getPvkDokumentData().getHarInvolvertRepresentant());
        newLine();
        addDataText("Utdyp hvordan dere har involvert representant(er) for de registrerte", pvkDokument.getPvkDokumentData().getRepresentantInvolveringsBeskrivelse());
        newLine();
        addHeading3("Representanter for databehandlere");
        addDatabehandlerList(behandlingList);
        newLine();
        addBooleanDataText("Har dere involvert en representant for databehandlere?", pvkDokument.getPvkDokumentData().getHarDatabehandlerRepresentantInvolvering());
        newLine();
        addDataText("Utdyp hvordan dere har involvert representant(er) for databehandler(e)", pvkDokument.getPvkDokumentData().getDataBehandlerRepresentantInvolveringBeskrivelse());
        newLine();
        if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
            generatePvoTilbakemelding(pvoVudering.getInnvolveringAvEksterne());
        }
    }

    public void generateRisikoscenarioOgTiltak(List<RisikoscenarioResponse> risikoscenarioList, List<TiltakResponse> tiltakList, PvoTilbakemelding pvoTilbakemelding, Vurdering pvoVudering) {
        newLine();
        var header2 = addHeading2("Risikoscenario, tiltak, og tiltakenes effekt");
        addBookmark(header2, "pvk_risikoscenario_og_tiltak");
        newLine();
        risikoscenarioList.forEach(risikoscenario -> {
            addHeading3(risikoscenario.getNavn());
            addMarkdownText("**Status**: " + getRisikoscenarioStatus(risikoscenario));
            newLine();
            if (risikoscenario.getBeskrivelse().isEmpty()) {
                addText("Ikke besvart");
            } else {
                addMarkdownText(risikoscenario.getBeskrivelse());
            }
            newLine();
            if (risikoscenario.isGenerelScenario()) {
                addText("Dette scenarioet er ikke tilknyttet spesifikke etterlevelseskrav.");
            } else {
                addText("Etterlevelseskrav hvor risikoscenarioet inntreffer");
                newLine();
                risikoscenario.getRelevanteKravNummer().forEach(kravRef -> {
                    addMarkdownText("- K" + kravRef.getKravNummer() + "." + kravRef.getKravVersjon() + " " + kravRef.getNavn());
                });
            }
            newLine();
            addLabel(sannsynlighetsNivaaToText(risikoscenario.getSannsynlighetsNivaa()));
            newLine();
            if (risikoscenario.getSannsynlighetsNivaaBegrunnelse().isEmpty()) {
                addText("Ingen begrunnelse");
            } else {
                addMarkdownText(risikoscenario.getSannsynlighetsNivaaBegrunnelse());
            }
            newLine();
            addLabel(konsekvensNivaaToText(risikoscenario.getKonsekvensNivaa()));
            newLine();
            if (risikoscenario.getKonsekvensNivaaBegrunnelse().isEmpty()) {
                addText("Ingen begrunnelse");
            } else {
                addMarkdownText(risikoscenario.getKonsekvensNivaaBegrunnelse());
            }
            newLine();
            addHeading4("Følgende tiltak gjelder for dette risikoscenarioet");
            newLine();
            if (risikoscenario.getIngenTiltak() != null && risikoscenario.getIngenTiltak()) {
                addText("Tiltak ikke aktuelt");
            } else if (risikoscenario.getTiltakIds().isEmpty()) {
                addText("Risikoscenario mangler tiltak");
            } else {
                generateTiltak(risikoscenario, tiltakList, risikoscenarioList);
            }
            newLine();
            addHeading4("Antatt risikonivå etter gjennomførte tiltak");
            addLabel(sannsynlighetsNivaaToText(risikoscenario.getSannsynlighetsNivaaEtterTiltak()));
            newLine();
            addLabel(konsekvensNivaaToText(risikoscenario.getKonsekvensNivaaEtterTiltak()));
            newLine();
            if (risikoscenario.getNivaaBegrunnelseEtterTiltak().isEmpty()) {
                addText("Ingen begrunnelse");
            } else {
                addMarkdownText(risikoscenario.getNivaaBegrunnelseEtterTiltak());
            }
            newLine();

        });
        newLine();
        if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
            generatePvoTilbakemelding(pvoVudering.getRisikoscenarioEtterTiltakk());
        }
    }

    public void generateTiltak(RisikoscenarioResponse risikoscenario, List<TiltakResponse> tiltakList, List<RisikoscenarioResponse> risikoscenarioResponseList) {
        List<TiltakResponse> gjeldendeTiltak = tiltakList.stream()
                .filter(tiltak -> risikoscenario.getTiltakIds().contains(tiltak.getId())).toList();


        gjeldendeTiltak.forEach(tiltak -> {
            List<UUID> gjenbruktScenarioIds = tiltak.getRisikoscenarioIds().stream().filter(id -> !risikoscenario.getId().equals(id)).toList();
            List<String> gjenbruktScenarioNames = risikoscenarioResponseList.stream().filter(risikoscenarioResponse -> gjenbruktScenarioIds.contains(risikoscenarioResponse.getId()))
                    .map(RisikoscenarioResponse::getNavn).toList();

            addHeading5(tiltak.getNavn());
            newLine();
            addMarkdownText(tiltak.getBeskrivelse());
            newLine();
            addLabel("Tiltaksansvarlig team:");
            addText(getAnsvarligTeam(tiltak.getAnsvarligTeam()));
            newLine();
            addLabel("Tiltaksansvarlig person:");
            addText(getAnsvarligPerson(tiltak.getAnsvarlig()));
            newLine();
            addLabel("Tiltaksfrist:");
            addText( dateToString(tiltak.getFrist()));
            addLabel("Iversatt:");
            addText( dateToString(tiltak.getIverksattDato()));
            newLine();
            if (!gjenbruktScenarioIds.isEmpty()) {
                addLabel("Tiltaket er gjenbrukt ved følgende scenarioer:");
                gjenbruktScenarioNames.forEach(name -> addMarkdownText("- " + name));
                newLine();
            }
        });
    }

    public void generatePvoTilbakemelding(Tilbakemeldingsinnhold tilbakemelding) {
        addHeading3("Tilbakemelding fra Personvernombudet");
        newLine();
        addLabel("Vurdéring av etterleverens svar.");
        addText(vurderingsBidragToText(tilbakemelding.getBidragsVurdering()));
        newLine();
        addLabel("Tilbakemelding");
        if (tilbakemelding.getTilbakemeldingTilEtterlevere() != null && !tilbakemelding.getTilbakemeldingTilEtterlevere().isBlank()) {
            addMarkdownText(tilbakemelding.getTilbakemeldingTilEtterlevere());
        } else {
            addText("Ingen tilbakemelding");
        }
    }

    public String getAnsvarligTeam(TeamResponse ansvarligTeam) {
        if (ansvarligTeam == null || ansvarligTeam.getName() == null || ansvarligTeam.getName().isEmpty()) {
            return "Ingen ansvarlig team er satt";
        }
        return ansvarligTeam.getName();
    }

    public String getAnsvarligPerson(Resource ansvarlig) {
        if (ansvarlig == null || ansvarlig.getFullName() == null || ansvarlig.getFullName().isEmpty()) {
            return "Ingen ansvarlig person er satt";
        }
        return ansvarlig.getFullName();
    }

    public String dateToString(LocalDate date) {
        if (date == null) {
            return "Ikke angitt";
        } else {
            return DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG).format(date);
        }
    }

    public String vurderingsBidragToText(String vurderingsBidrag) {
        return switch (vurderingsBidrag) {
            case "TILSTREKELIG" -> "Ja, tilstrekkelig";
            case "TILSTREKKELIG_FORBEHOLDT" ->
                    "Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som beskrives i fritekst under";
            case "UTILSTREKELIG" -> "Utilstrekkelig, beskrives nærmere under";
            default -> "Ingen vurdering";
        };
    }

    public String sannsynlighetsNivaaToText(Integer sannsynlighetsnivaa) {
        return switch (sannsynlighetsnivaa) {
            case 1 -> "Meget lite sannsynlig";
            case 2 -> "Lite sannsynlig";
            case 3 -> "Moderat sannsynlig";
            case 4 -> "Sannsynlig";
            case 5 -> "Nesten sikkert";
            default -> "Ingen sannsynlighetsnivå satt";
        };
    }

    public String konsekvensNivaaToText(Integer konsekvensnivaa) {
        return switch (konsekvensnivaa) {
            case 1 -> "Ubetydelig konsekvens";
            case 2 -> "Lav konsekvens";
            case 3 -> "Moderat konsekvens";
            case 4 -> "Alvorlig konsekvens";
            case 5 -> "Svært alvorlig konsekvens";
            default -> "Ingen konsekvensnivå satt";
        };
    }

    public String getRisikoscenarioStatus(RisikoscenarioResponse risikoscenario) {
        String status;
        if (risikoscenario.getKonsekvensNivaa() == 0 || risikoscenario.getSannsynlighetsNivaa() == 0 || risikoscenario.getKonsekvensNivaaBegrunnelse().isEmpty() || risikoscenario.getSannsynlighetsNivaaBegrunnelse().isEmpty()) {
            status = "Scenario er mangelfullt";
        } else if (risikoscenario.getIngenTiltak() != null && risikoscenario.getIngenTiltak()) {
            status = "Tiltak ikke akutelt";
        } else if (risikoscenario.getTiltakIds().isEmpty()) {
            status = "Mangler tiltak";
        } else if (risikoscenario.getKonsekvensNivaaEtterTiltak() == 0 || risikoscenario.getSannsynlighetsNivaaEtterTiltak() == 0 || risikoscenario.getNivaaBegrunnelseEtterTiltak().isEmpty()) {
            status = "Ikke ferdig vurdert";
        } else {
            status = "Ferdig vurdert";
        }
        return status;
    }

    public void addBooleanDataText(String label, Boolean value) {
        addLabel(label);
        addText(BooleanUtils.toString(value, "Ja", "Nei", "Ikke besvart"));
    }


    public void addDataText(String label, String text) {
        addLabel(label);
        if (text == null) {
            addText("Ikke besvart");
        } else {
            addMarkdownText(text);
        }
    }

    public void generateOvrigeEgenskaperFraBehandlinger(PvkDokument pvkDokument) {
        var allYtterligeEgenskaper = CodelistService.getCodelist(ListName.YTTERLIGERE_EGENSKAPER);
        var valgteEgenskaper = pvkDokument.getPvkDokumentData().getYtterligereEgenskaper();

        addLabel("Øvrige egenskaper for behandlingene:");

        var gjelderFor = allYtterligeEgenskaper.stream()
                .filter(egenskap -> valgteEgenskaper != null && valgteEgenskaper.contains(egenskap.getCode()))
                .toList();
        var gjelderIkkeFor = allYtterligeEgenskaper.stream()
                .filter(egenskap -> valgteEgenskaper == null || !valgteEgenskaper.contains(egenskap.getCode()))
                .toList();

        if (!gjelderFor.isEmpty()) {
            addLabel("Gjeldende egenskaper:");
            gjelderFor.forEach(egenskap -> addMarkdownText("- " + egenskap.getShortName().toLowerCase()));
        }

        if (!gjelderIkkeFor.isEmpty()) {
            addLabel("Disse egenskapene gjelder ikke:");
            gjelderIkkeFor.forEach(egenskap -> addMarkdownText("- " + egenskap.getShortName().toLowerCase()));
        }
    }

    public void generateEgenskaperFraBehandlinger(List<Behandling> behandlingList) {
        List<PolicyResponse> alleOpplysningstyper = new ArrayList<>();
        List<Boolean> alleProfilering = new ArrayList<>();
        List<Boolean> alleAutomatiskBehandling = new ArrayList<>();
        AtomicBoolean manglerOpplysningstyper = new AtomicBoolean(false);

        if (behandlingList != null && !behandlingList.isEmpty()) {
            behandlingList.forEach(behandling -> {
                if (behandling != null) {
                    if (behandling.getPolicies() == null || behandling.getPolicies().isEmpty()) {
                        manglerOpplysningstyper.set(true);
                    } else {
                        alleOpplysningstyper.addAll(behandling.getPolicies());
                    }

                    alleProfilering.add(behandling.getProfilering());
                    alleAutomatiskBehandling.add(behandling.getAutomatiskBehandling());
                }
            });
        } else {
            manglerOpplysningstyper.set(true);
            alleProfilering.add(null);
            alleAutomatiskBehandling.add(null);
        }

        var saerligKategorierOppsumert = alleOpplysningstyper.stream().filter(type -> type.getSensitivity().getCode().equals("SAERLIGE")).toList();

        boolean profileringGjelder = alleProfilering.contains(true);
        boolean profileringGjelderIkke = !alleProfilering.isEmpty() && alleProfilering.stream().allMatch(value -> value != null && value.equals(false));

        boolean automatiskGjelder = alleAutomatiskBehandling.contains(true);
        boolean automatiskGjelderIkke = !alleAutomatiskBehandling.isEmpty() && alleAutomatiskBehandling.stream().allMatch(value -> value != null && value.equals(false));

        boolean saerligGjelder = !manglerOpplysningstyper.get() && !saerligKategorierOppsumert.isEmpty();
        boolean saerligGjelderIkke = !manglerOpplysningstyper.get() && saerligKategorierOppsumert.isEmpty();

        addLabel("Følgende informasjon er hentet fra Behandlingskatalogen:");

        List<String> gjeldendeEgenskaper = new ArrayList<>();
        if (profileringGjelder) gjeldendeEgenskaper.add("profilering");
        if (automatiskGjelder) gjeldendeEgenskaper.add("helautomatisert behandling");
        if (saerligGjelder) gjeldendeEgenskaper.add("særlige kategorier av personopplysninger");

        List<String> ikkeGjeldendeEgenskaper = new ArrayList<>();
        if (profileringGjelderIkke) ikkeGjeldendeEgenskaper.add("profilering");
        if (automatiskGjelderIkke) ikkeGjeldendeEgenskaper.add("helautomatisert behandling");
        if (saerligGjelderIkke) ikkeGjeldendeEgenskaper.add("særlige kategorier av personopplysninger");

        List<String> ikkeVurderteEgenskaper = new ArrayList<>();
        if (!profileringGjelder && !profileringGjelderIkke) ikkeVurderteEgenskaper.add("profilering");
        if (!automatiskGjelder && !automatiskGjelderIkke) ikkeVurderteEgenskaper.add("helautomatisert behandling");
        if (manglerOpplysningstyper.get()) ikkeVurderteEgenskaper.add("særlige kategorier av personopplysninger");

        if (!gjeldendeEgenskaper.isEmpty()) {
            addLabel("Gjeldende egenskaper:");
            gjeldendeEgenskaper.forEach(egenskap -> addMarkdownText("- " + egenskap));
        }

        if (!ikkeGjeldendeEgenskaper.isEmpty()) {
            addLabel("Disse egenskapene gjelder ikke:");
            ikkeGjeldendeEgenskaper.forEach(egenskap -> addMarkdownText("- " + egenskap));
        }

        if (!ikkeVurderteEgenskaper.isEmpty()) {
            addLabel("Dere har ikke vurdert følgende egenskaper i Behandlingskatalogen:");
            ikkeVurderteEgenskaper.forEach(egenskap -> addMarkdownText("- " + egenskap));
        }

    }

    public void addDatabehandlerList(List<Behandling> behandlingList) {
        addLabel("I Behandlingskatalogen står det at følgende databehandlere benyttes:");
        newLine();
        List<DataBehandler> databehandlerList = new ArrayList<>();

        behandlingList.forEach(behandling -> {
            databehandlerList.addAll(behandling.getDataBehandlerList());
        });
        List<String> databehandlerNavnList = new ArrayList<>(databehandlerList.stream().map(DataBehandler::getNavn).toList());
        Set<String> set = new HashSet<>(databehandlerNavnList);
        databehandlerNavnList.clear();
        databehandlerNavnList.addAll(set);
        if (databehandlerNavnList.isEmpty()) {
            addMarkdownText("- Ingen databehandlere");
        } else {
            databehandlerNavnList.forEach(navn -> addMarkdownText("- " + navn));
        }
    }

    public void addPersonkategoriList(List<Behandling> behandlingList) {
        List<ExternalCode> personkategorier = new ArrayList<>();

        behandlingList.forEach(behandling -> {
            behandling.getPolicies().forEach(policy -> {
                personkategorier.addAll(policy.getPersonKategorier());
            });
        });

        addLabel("I Behandlingskatalogen står det at dere behandler personopplysninger om:");
        newLine();
        List<String> personkategoriList = new ArrayList<>(personkategorier.stream().map(ExternalCode::getShortName).toList());
        Set<String> set = new HashSet<>(personkategoriList);
        personkategoriList.clear();
        personkategoriList.addAll(set);

        if (personkategorier.isEmpty()) {
            addMarkdownText("- Ingen personkategorier");
        } else {
            personkategoriList.forEach(personkategori -> {
                addMarkdownText("- " + personkategori);
            });
        }
    }


    public String pvkDokumentStatusText(PvkDokumentStatus status) {
        return switch (status) {
            case UNDERARBEID -> "Under arbeid";
            case SENDT_TIL_PVO -> "Sendt til personvernombudet";
            case VURDERT_AV_PVO_TRENGER_MER_ARBEID -> "Personverkonsekvensvurdering trenger mer arbeid";
            case SENDT_TIL_PVO_FOR_REVURDERING -> "Personverkonsekvensvurdering er sendt tilbake til personvernombudet for revurdering";
            case PVO_UNDERARBEID -> "Personvernombudet jobber med vurderingen";
            case VURDERT_AV_PVO -> "Vurdert av personvernombudet";
            case TRENGER_GODKJENNING -> "Trenger godkjenning fra risikoeier";
            case GODKJENT_AV_RISIKOEIER -> "Godkjent av risikoeier";
        };
    }
}
