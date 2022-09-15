package no.nav.data.etterlevelse.arkivering;


import lombok.SneakyThrows;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.ZipUtils;
import no.nav.data.etterlevelse.arkivering.domain.ArchiveFile;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivRepo;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivStatus;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.export.EtterlevelseToDoc;
import org.springframework.data.domain.Page;
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
public class EtterlevelseArkivService extends DomainService<EtterlevelseArkiv> {
    private final EtterlevelseArkivRepo repo;
    private final EtterlevelseToDoc etterlevelseToDoc;

    private final BehandlingService behandlingService;

    public EtterlevelseArkivService(EtterlevelseArkivRepo repo, EtterlevelseToDoc etterlevelseToDoc, BehandlingService behandlingService) {
        super(EtterlevelseArkiv.class);
        this.repo = repo;
        this.etterlevelseToDoc = etterlevelseToDoc;
        this.behandlingService = behandlingService;
    }

    public Page<EtterlevelseArkiv> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::toEtterlevelseArkiv);
    }

    public List<EtterlevelseArkiv> getByWebsakNummer(String websakNummer) {
        return GenericStorage.to(repo.findByWebsakNummer(websakNummer), EtterlevelseArkiv.class);
    }

    public List<EtterlevelseArkiv> getByStatus(String status) {
        return GenericStorage.to(repo.findByStatus(status), EtterlevelseArkiv.class);
    }

    public List<EtterlevelseArkiv> getByBehandling(String behandlingId) {
        return GenericStorage.to(repo.findByBehandling(behandlingId), EtterlevelseArkiv.class);
    }

    public byte[] getEtterlevelserArchiveZip(List<EtterlevelseArkiv> etterlevelseArkivList) throws IOException {
        String filename;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy'-'MM'-'dd'_'HH'-'mm'-'ss");
        Date date = new Date();

        ZipUtils zipUtils = new ZipUtils();
        List<ArchiveFile> archiveFiles = new ArrayList<>();

        for (EtterlevelseArkiv etterlevelseArkiv : etterlevelseArkivList) {
            Behandling behandling = behandlingService.getBehandling(etterlevelseArkiv.getBehandlingId());
            ArrayList<String> statuses = new ArrayList<>();
            statuses.add(EtterlevelseStatus.FERDIG_DOKUMENTERT.name());
            statuses.add(EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT.name());
            archiveFiles.add(ArchiveFile.builder()
                    .fileName(formatter.format(date) + "_Etterlevelse_B" + behandling.getNummer() + ".docx")
                    .file(etterlevelseToDoc.generateDocFor(UUID.fromString(behandling.getId()), statuses, Collections.emptyList(), ""))
                    .build());
            archiveFiles.add(ArchiveFile.builder()
                    .fileName(formatter.format(date) + "_Etterlevelse_B" + behandling.getNummer() + ".xml")
                    .file(createXml(date))
                    .build());
        }
        return zipUtils.zipOutputStream(archiveFiles);
    }

    @SneakyThrows
    public byte[] createXml(Date date) {

        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();

        Document document = documentBuilder.newDocument();
        Element rootElement = document.createElement("NOARK.H");
        rootElement.setAttribute("xmlns:wc","http://noark4.webcruiter.no/xml/");
        document.appendChild(rootElement);

        Element noarksak = document.createElement("NOARKSAK");
        rootElement.appendChild(noarksak);

        Element sasakid = document.createElement("SA.SAKID");
        sasakid.appendChild(document.createTextNode("21/13285"));
        noarksak.appendChild(sasakid);

        Element journalpostTab = document.createElement("JORNALPOST.TAB");
        noarksak.appendChild(journalpostTab);

        Element journalpost = document.createElement("JOURNALPOST");
        journalpostTab.appendChild(journalpost);

        Element jpInnhold = document.createElement("JP.INNHOLD");
         jpInnhold.appendChild(document.createTextNode("Etterlevelse for B455 Etterlevelse: Støtte til etterlevelse og forvaltning av etterlevelseskrav"));
         journalpost.appendChild(jpInnhold);

        Element jpU1 = document.createElement("JP.U1");
        jpU1.appendChild(document.createTextNode("2"));
        journalpost.appendChild(jpU1);

        Element jpParagraphId = document.createElement("JP.PARAGRAFID");
        jpParagraphId.appendChild(document.createTextNode("40"));
        journalpost.appendChild(jpParagraphId);

        SimpleDateFormat dateTime = new SimpleDateFormat("yyyymmdd");
        Element jpDokdato = document.createElement("JP.DOKDATO");
        jpDokdato.appendChild(document.createTextNode(dateTime.format(date)));
        journalpost.appendChild(jpDokdato);

        Element jpDoktype = document.createElement("JP.DOKDATO");
        jpDoktype.appendChild(document.createTextNode("X"));
        journalpost.appendChild(jpDoktype);

        Element jpStatus = document.createElement("JP.STATUS");
        jpStatus.appendChild(document.createTextNode("J"));
        journalpost.appendChild(jpStatus);

        Element jpSb = document.createElement("JP.SB");
        jpSb.appendChild(document.createTextNode("T162195"));
        journalpost.appendChild(jpSb);

        Element jbEnhet = document.createElement("JP.ENHET");
        jbEnhet.appendChild(document.createTextNode("8353005"));
        journalpost.appendChild(jbEnhet);

        Element dokVersjonTab = document.createElement("DOKVERSJON.TAB");
        journalpost.appendChild(dokVersjonTab);

        Element dokVersjon = document.createElement("DOKVERSJON");
        dokVersjonTab.appendChild(dokVersjon);

        Element veDokformat = document.createElement("VE.DOKFORMAT");
        veDokformat.appendChild(document.createTextNode("DOCX"));
        dokVersjon.appendChild(veDokformat);

        Element veFilref = document.createElement("VE.FILREF");
        veFilref.appendChild(document.createTextNode("2022-07-08_12-34-56_Etterlevelse_B455.docx"));
        dokVersjon.appendChild(veFilref);

        //...create XML elements, and others...
        // write dom document to a file
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        DOMSource domSource = new DOMSource(document);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        StreamResult result = new StreamResult(baos);
        transformer.setOutputProperty(OutputKeys.INDENT,"yes");
        transformer.transform(domSource,result);
//        XMLUtils.outputDOM(document, baos, true);
//        return baos.toByteArray();
        return baos.toByteArray();
    }

    public List<EtterlevelseArkiv> setStatusToArkivert() {
        return GenericStorage.to(repo.updateStatus(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING.name(), EtterlevelseArkivStatus.ARKIVERT.name()), EtterlevelseArkiv.class);
    }

    public List<EtterlevelseArkiv> setStatusToBehandler_arkivering() {
        return GenericStorage.to(repo.updateStatus(EtterlevelseArkivStatus.TIL_ARKIVERING.name(), EtterlevelseArkivStatus.BEHANDLER_ARKIVERING.name()), EtterlevelseArkiv.class);
    }

    public List<EtterlevelseArkiv> setStatusWithBehandlingsId(String oldStatus, String newStatus, String behandlingsId) {
        return GenericStorage.to(repo.updateStatusWithBehandlingsId(oldStatus, newStatus, behandlingsId), EtterlevelseArkiv.class);
    }

    public EtterlevelseArkiv save(EtterlevelseArkivRequest request) {
        var etterlevelseArkiv = request.isUpdate() ? storage.get(request.getIdAsUUID(), EtterlevelseArkiv.class) : new EtterlevelseArkiv();
        etterlevelseArkiv.convert(request);

        return storage.save(etterlevelseArkiv);
    }

    public EtterlevelseArkiv delete(UUID id) {
        return storage.delete(id, EtterlevelseArkiv.class);
    }
}
