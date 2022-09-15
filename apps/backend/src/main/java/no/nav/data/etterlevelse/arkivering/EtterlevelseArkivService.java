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
                    .file(createXml())
                    .build());
        }
        return zipUtils.zipOutputStream(archiveFiles);
    }

    @SneakyThrows
    public byte[] createXml() {

        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();

        Document document = documentBuilder.newDocument();
        Element rootElement = document.createElement("company");
        document.appendChild(rootElement);

        document.createElement("staff");
        rootElement.appendChild(document.createElement("staff"));

        //...create XML elements, and others...
        // write dom document to a file
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        DOMSource domSource = new DOMSource(document);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        StreamResult result = new StreamResult(baos);
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
