package no.nav.data.common.utils;

import com.vladsch.flexmark.docx.converter.DocxRenderer;
import com.vladsch.flexmark.ext.definition.DefinitionExtension;
import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughSubscriptExtension;
import com.vladsch.flexmark.ext.ins.InsExtension;
import com.vladsch.flexmark.ext.superscript.SuperscriptExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.ext.toc.SimTocExtension;
import com.vladsch.flexmark.ext.toc.TocExtension;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.MutableDataSet;
import lombok.SneakyThrows;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.common.domain.ExternalCode;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.behandling.dto.DataBehandler;
import no.nav.data.integration.behandling.dto.PolicyResponse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.Tilbakemeldingsinnhold;
import no.nav.data.pvk.pvotilbakemelding.domain.TilhorendeDokumentasjonTilbakemelding;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import no.nav.data.pvk.tiltak.dto.TiltakResponse;
import org.apache.commons.lang3.BooleanUtils;
import org.docx4j.model.table.TblFactory;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.FooterPart;
import org.docx4j.openpackaging.parts.WordprocessingML.MainDocumentPart;
import org.docx4j.wml.*;

import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

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
        pack = DocxRenderer.getDefaultTemplate();
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
    public void generateBehandlingensArtOgOmfang(PvkDokument pvkDokument, List<Behandling> behandlingList, PvoTilbakemelding pvoTilbakemelding) {
        newLine();
        var header2 = addHeading2("Behandlingens art og omfang");
        addBookmark(header2, "pvk_art_og_omfang");
        newLine();
        addPersonkategoriList(behandlingList);
        newLine();
        addBooleanDataText("Stemmer denne lista over personkategorier?", pvkDokument.getPvkDokumentData().getStemmerPersonkategorier());
        newLine();
        addDataText("For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om.", pvkDokument.getPvkDokumentData().getPersonkategoriAntallBeskrivelse());
        newLine();
        addDataText("Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang.", pvkDokument.getPvkDokumentData().getTilgangsBeskrivelsePersonopplysningene());
        newLine();
        addDataText("Beskriv hvordan og hvor lenge personopplysningene skal lagres.", pvkDokument.getPvkDokumentData().getLagringsBeskrivelsePersonopplysningene());
        newLine();
        generatePvoTilbakemelding(pvoTilbakemelding.getPvoTilbakemeldingData().getBehandlingensArtOgOmfang());
    }

    public void generateTilhorendeDokumentasjon(EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, long antallPvkKrav, long antallFerdigPvkKrav,TilhorendeDokumentasjonTilbakemelding tilbakemelding) {
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
        addMarkdownText("- " + 0 + " av " + antallPvkKrav + " krav er ferdig utfylt.");
        newLine();

        //ROS
        addHeading3("Risiko- og sårbarhetsvurdering (ROS)");
        addText("Dersom dere har gjennomført en eller flere risikovurderinger, skal disse legges ved etterlevelsesdokumentasjonen.");
        newLine();
        addText("Dere har koblet følgende dokumenter på dette dokumentet:");
        if(etterlevelseDokumentasjon.getRisikovurderinger().isEmpty()){
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

        addHeading3("Behandlinger i Behandlingskatalogen");
        addLabel("Vurdér om dokumentasjon i Behandlingskatalogen er tilstrekkelig.");
        addText(vurderingsBidragToText(tilbakemelding.getBehandlingskatalogDokumentasjonTilstrekkelig()));
        newLine();
        addLabel("Tilbakemelding");
        if (tilbakemelding.getBehandlingskatalogDokumentasjonTilbakemelding() != null && !tilbakemelding.getBehandlingskatalogDokumentasjonTilbakemelding().isBlank()) {
            addMarkdownText(tilbakemelding.getBehandlingskatalogDokumentasjonTilbakemelding());
        } else {
            addText("Ingen tilbakemelding");
        }
        newLine();

        addHeading3("PVK-relaterte etterlevelseskrav");
        addLabel("Vurdering om kravdokumentasjon er tilstrekkelig.");
        addText(vurderingsBidragToText(tilbakemelding.getKravDokumentasjonTilstrekkelig()));
        newLine();
        addLabel("Tilbakemelding");
        if (tilbakemelding.getRisikovurderingTilbakemelding() != null && !tilbakemelding.getRisikovurderingTilbakemelding().isBlank()) {
            addMarkdownText(tilbakemelding.getRisikovurderingTilbakemelding());
        } else {
            addText("Ingen tilbakemelding");
        }
        newLine();

        addHeading3("Risiko- og sårbarhetsvurdering (ROS)");
        addLabel("Vurdering om risikovurderingen(e) er tilstrekkelig.");
        addText(vurderingsBidragToText(tilbakemelding.getRisikovurderingTilstrekkelig()));
        newLine();
        addLabel("Tilbakemelding");
        if (tilbakemelding.getRisikovurderingTilbakemelding() != null && !tilbakemelding.getRisikovurderingTilbakemelding().isBlank()) {
            addMarkdownText(tilbakemelding.getRisikovurderingTilbakemelding());
        } else {
            addText("Ingen tilbakemelding");
        }
    }

    public void generateInnvolveringAvEksterne(PvkDokument pvkDokument, List<Behandling> behandlingList, PvoTilbakemelding pvoTilbakemelding) {
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
        generatePvoTilbakemelding(pvoTilbakemelding.getPvoTilbakemeldingData().getInnvolveringAvEksterne());
    }

    public void generateRisikoscenarioOgTiltak(List<RisikoscenarioResponse> risikoscenarioList, List<TiltakResponse> tiltakList, PvoTilbakemelding pvoTilbakemelding) {
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
        generatePvoTilbakemelding(pvoTilbakemelding.getPvoTilbakemeldingData().getRisikoscenarioEtterTiltakk());
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
            addLabel("Tiltaksansvarlig:");
            addText(getAnsvarlig(tiltak.getAnsvarlig()));
            newLine();
            addLabel("Tiltaksfrist:");
            addText( dateToString(tiltak.getFrist()));
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

    public String getAnsvarlig(Resource ansvarlig) {
        if (ansvarlig.getFullName() == null || ansvarlig.getFullName().isEmpty()) {
            return "Ingen ansvarlig er satt";
        } else {
            return ansvarlig.getFullName();
        }
    }

    public String dateToString(LocalDate date) {
        if (date == null) {
            return "Det er ikke satt en frist for tiltaket";
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
            default -> "Ingen  vurdert";
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

        addLabel("Øvrige egenskaper for behandlingene:");
        newLine();
        allYtterligeEgenskaper.forEach(egenskap -> {
            if (pvkDokument.getPvkDokumentData().getYtterligereEgenskaper().contains(egenskap.getCode())) {
                addMarkdownText("- **Det gjelder for** " + egenskap.getShortName().toLowerCase());
            } else {
                addMarkdownText("- **Det gjelder ikke for** " + egenskap.getShortName().toLowerCase());
            }
        });

    }

    public void generateEgenskaperFraBehandlinger(List<Behandling> behandlingList) {
        List<PolicyResponse> alleOpplysningstyper = new ArrayList<>();
        List<Boolean> alleProfilering = new ArrayList<>();
        List<Boolean> alleAutomatiskBehandling = new ArrayList<>();
        AtomicBoolean manglerOpplysningstyper = new AtomicBoolean(false);

        behandlingList.forEach(behandling -> {
            if (behandling.getPolicies().isEmpty()) {
                manglerOpplysningstyper.set(true);
            } else {
                alleOpplysningstyper.addAll(behandling.getPolicies());
            }

            alleProfilering.add(behandling.getProfilering());
            alleAutomatiskBehandling.add(behandling.getAutomatiskBehandling());
        });

        var saerligKategorierOppsumert = alleOpplysningstyper.stream().filter(type -> type.getSensitivity().getCode().equals("SAERLIGE")).toList();

        addLabel("Følgende egenskaper er hentet fra Behandlingskatalogen:");
        newLine();
        if (alleProfilering.contains(true)) {
            addMarkdownText("- **Det gjelder** profilering");
        } else if (alleProfilering.stream().filter(value -> value == false).toList().size() == alleProfilering.size()) {
            addMarkdownText("- **Det gjelder ikke** profilering");
        } else if (alleProfilering.contains(null)) {
            addMarkdownText("- Mangler informasjon for å vite om profilering");
        }

        if (alleAutomatiskBehandling.contains(true)) {
            addMarkdownText("- **Det gjelder** automatisert behandling");
        } else if (alleAutomatiskBehandling.stream().filter(value -> value == false).toList().size() == alleAutomatiskBehandling.size()) {
            addMarkdownText("- **Det gjelder ikke** automatisert behandling");
        } else if (alleAutomatiskBehandling.contains(null)) {
            addMarkdownText("- Mangler informasjon for å vite om automatisert behandling");
        }

        if (!manglerOpplysningstyper.get() && !saerligKategorierOppsumert.isEmpty()) {
            addMarkdownText("- **Det gjelder** saerlig kategorier");
        } else if (!manglerOpplysningstyper.get() && saerligKategorierOppsumert.isEmpty()) {
            addMarkdownText("- **Det gjelder ikke** saerlig kategorier");
        } else if (manglerOpplysningstyper.get()) {
            addMarkdownText("- Mangler informasjon for å vite saerlig kategorier");
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
        databehandlerNavnList.forEach(navn -> addMarkdownText("- " + navn));
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
        personkategoriList.forEach(personkategori -> {
            addMarkdownText("- " + personkategori);
        });
    }


    public String pvkDokumentStatusText(PvkDokumentStatus status) {
        return switch (status) {
            case AKTIV, UNDERARBEID -> "Under arbeid";
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
