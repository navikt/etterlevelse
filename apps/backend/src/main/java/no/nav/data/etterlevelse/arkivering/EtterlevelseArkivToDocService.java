package no.nav.data.etterlevelse.arkivering;

import lombok.SneakyThrows;
import no.nav.data.common.utils.ZipUtils;
import no.nav.data.etterlevelse.arkivering.domain.ArchiveFile;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.export.EtterlevelseDokumentasjonToDoc;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class EtterlevelseArkivToDocService extends DomainService<EtterlevelseArkiv> {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;

    public EtterlevelseArkivToDocService(EtterlevelseDokumentasjonService etterlevelseDokumentasjonService, EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc) {
        this.etterlevelseDokumentasjonService = etterlevelseDokumentasjonService;
        this.etterlevelseDokumentasjonToDoc = etterlevelseDokumentasjonToDoc;
    }

    public byte[] getEtterlevelserArchiveZip(List<EtterlevelseArkiv> etterlevelseArkivList) throws IOException {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");
        SimpleDateFormat xmlDateFormatter = new SimpleDateFormat("YYYYMMdd_HHmmss");
        Date date = new Date();

        ZipUtils zipUtils = new ZipUtils();
        List<ArchiveFile> archiveFiles = new ArrayList<>();

        for (EtterlevelseArkiv etterlevelseArkiv : etterlevelseArkivList) {
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(etterlevelseArkiv.getEtterlevelseDokumentasjonId()));
            ArrayList<String> statuses = new ArrayList<>();
            statuses.add(EtterlevelseStatus.FERDIG_DOKUMENTERT.name());
            statuses.add(EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT.name());
            archiveFiles.add(ArchiveFile.builder()
                    .fileName(formatter.format(date) + "_Etterlevelse_E" + etterlevelseDokumentasjon.getEtterlevelseNummer() + ".docx")
                    .file(etterlevelseDokumentasjonToDoc.generateDocFor(etterlevelseDokumentasjon.getId(), statuses, Collections.emptyList(), ""))
                    .build());
            archiveFiles.add(ArchiveFile.builder()
                    .fileName(xmlDateFormatter.format(date) + "_Etterlevelse_E" + etterlevelseDokumentasjon.getEtterlevelseNummer() + ".xml")
                    .file(createXml(date, formatter.format(date) + "_Etterlevelse_E" + etterlevelseDokumentasjon.getEtterlevelseNummer() + ".docx", etterlevelseDokumentasjon, etterlevelseArkiv))
                    .build());
        }
        return zipUtils.zipOutputStream(archiveFiles);
    }

    private void createElement(String tagName, String data, Element parent, Document document) {
        Element newElement = document.createElement(tagName);
        newElement.appendChild(document.createTextNode(data));
        parent.appendChild(newElement);
    }

    @SneakyThrows
    private byte[] createXml(Date date, String wordDocFileName, EtterlevelseDokumentasjon etterlevelseDokumentasjon, EtterlevelseArkiv etterlevelseArkiv) {

        String creatorId = etterlevelseArkiv.getChangeStamp().getLastModifiedBy().split(" ")[0];

        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();

        Document document = documentBuilder.newDocument();
        Element rootElement = document.createElement("NOARK.H");
        document.appendChild(rootElement);

        Element noarksak = document.createElement("NOARKSAK");
        rootElement.appendChild(noarksak);

        createElement("SA.ETTERLEVELSEID", "E" + etterlevelseDokumentasjon.getEtterlevelseNummer(), noarksak, document);

        Element journalpostTab = document.createElement("JOURNALPOST.TAB");
        noarksak.appendChild(journalpostTab);

        Element journalpost = document.createElement("JOURNALPOST");
        journalpostTab.appendChild(journalpost);

        createElement("JP.INNHOLD",
                "Etterlevelse for E" + etterlevelseDokumentasjon.getEtterlevelseNummer() + " - " + etterlevelseDokumentasjon.getTitle(),
                journalpost, document);

        SimpleDateFormat dateTime = new SimpleDateFormat("yyyyMMdd");
        createElement("JP.DOKDATO", dateTime.format(date), journalpost, document);

        createElement("JP.DOKTYPE", "X", journalpost, document);

        createElement("JP.STATUS", "J", journalpost, document);

        createElement("JP.SB", creatorId, journalpost, document);

        Element dokVersjonTab = document.createElement("DOKVERSJON.TAB");
        journalpost.appendChild(dokVersjonTab);

        Element dokVersjon = document.createElement("DOKVERSJON");
        dokVersjonTab.appendChild(dokVersjon);

        createElement("VE.DOKFORMAT", "DOCX", dokVersjon, document);

        createElement("VE.FILREF", wordDocFileName, dokVersjon, document);

        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        DOMSource domSource = new DOMSource(document);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        StreamResult result = new StreamResult(baos);
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.STANDALONE, "yes");
        transformer.transform(domSource, result);
        return baos.toByteArray();
    }
}