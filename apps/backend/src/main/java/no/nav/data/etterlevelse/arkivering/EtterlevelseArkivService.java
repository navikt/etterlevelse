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
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.export.EtterlevelseDokumentasjonToDoc;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;

@Service
public class EtterlevelseArkivService extends DomainService<EtterlevelseArkiv> {
    private final EtterlevelseArkivRepo repo;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc;

    public EtterlevelseArkivService(EtterlevelseArkivRepo repo, EtterlevelseDokumentasjonService etterlevelseDokumentasjonService, EtterlevelseDokumentasjonToDoc etterlevelseDokumentasjonToDoc) {
        this.repo = repo;
        this.etterlevelseDokumentasjonService = etterlevelseDokumentasjonService;
        this.etterlevelseDokumentasjonToDoc = etterlevelseDokumentasjonToDoc;
    }

    public Page<EtterlevelseArkiv> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public List<EtterlevelseArkiv> getByWebsakNummer(String websakNummer) {
        return convertToDomaionObject(repo.findByWebsakNummer(websakNummer));
    }

    public List<EtterlevelseArkiv> getByStatus(String status) {
        return convertToDomaionObject(repo.findByStatus(status));
    }

    public List<EtterlevelseArkiv> getByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
        return convertToDomaionObject(repo.findByEtterlevelseDokumentsjonId(etterlevelseDokumentasjonId));
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
    public byte[] createXml(Date date, String wordDocFileName, EtterlevelseDokumentasjon etterlevelseDokumentasjon, EtterlevelseArkiv etterlevelseArkiv) {

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

    public List<EtterlevelseArkiv> setStatusToArkivert() {
        LocalDateTime arkiveringDato = LocalDateTime.now();
        List<EtterlevelseArkiv> tilArkivertStatus = getByStatus(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING.name());
        List<EtterlevelseArkiv> arkivert = new ArrayList<>();
        tilArkivertStatus.forEach(e -> {
            EtterlevelseArkiv etterlevelseArkiv =  save(EtterlevelseArkivRequest.builder()
                    .id(e.getId().toString())
                    .behandlingId(e.getBehandlingId())
                    .etterlevelseDokumentasjonId(e.getEtterlevelseDokumentasjonId())
                    .status(EtterlevelseArkivStatus.ARKIVERT)
                    .arkiveringDato(arkiveringDato)
                    .tilArkiveringDato(e.getTilArkiveringDato())
                    .arkiveringAvbruttDato(e.getArkiveringAvbruttDato())
                    .webSakNummer(e.getWebSakNummer())
                    .update(true)
                    .build());
            arkivert.add(etterlevelseArkiv);
        });

        return arkivert;
    }

    public List<EtterlevelseArkiv> setStatusToBehandler_arkivering() {
        List<EtterlevelseArkiv> tilArkivering = getByStatus(EtterlevelseArkivStatus.TIL_ARKIVERING.name());
        List<EtterlevelseArkiv> behandlerArkivering = new ArrayList<>();
        tilArkivering.forEach(e -> {
            EtterlevelseArkiv etterlevelseArkiv = save(EtterlevelseArkivRequest.builder()
                    .id(e.getId().toString())
                    .behandlingId(e.getBehandlingId())
                    .etterlevelseDokumentasjonId(e.getEtterlevelseDokumentasjonId())
                    .status(EtterlevelseArkivStatus.BEHANDLER_ARKIVERING)
                    .arkiveringDato(e.getArkiveringDato())
                    .tilArkiveringDato(e.getTilArkiveringDato())
                    .arkiveringAvbruttDato(e.getArkiveringAvbruttDato())
                    .webSakNummer(e.getWebSakNummer())
                    .update(true)
                    .build());
            behandlerArkivering.add(etterlevelseArkiv);
        });
        return behandlerArkivering;
    }

    public void setStatusWithEtterlevelseDokumentasjonId(EtterlevelseArkivStatus newStatus, String etterlevelseDokumentasjonId) {
        List<EtterlevelseArkiv> arkiveringTilNyStatus = getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId);
        arkiveringTilNyStatus.forEach(e ->
            save(EtterlevelseArkivRequest.builder()
                    .id(e.getId().toString())
                    .behandlingId(e.getBehandlingId())
                    .etterlevelseDokumentasjonId(e.getEtterlevelseDokumentasjonId())
                    .status(newStatus)
                    .arkiveringDato(e.getArkiveringDato())
                    .tilArkiveringDato(e.getTilArkiveringDato())
                    .arkiveringAvbruttDato(e.getArkiveringAvbruttDato())
                    .webSakNummer(e.getWebSakNummer())
                    .update(true)
                    .build())
        );
    }

    public EtterlevelseArkiv save(EtterlevelseArkivRequest request) {
        var etterlevelseArkiv = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new EtterlevelseArkiv();
        etterlevelseArkiv.convert(request);

        return storage.save(etterlevelseArkiv);
    }

    public List<EtterlevelseArkiv> deleteByEtterlevelseDokumentsjonId(String etterlevelseDokumentasjonId){
        return convertToDomaionObject(repo.deleteByEtterlevelseDokumentsjonId(etterlevelseDokumentasjonId));
    }

    public EtterlevelseArkiv delete(UUID id) {
        return storage.delete(id);
    }
}
