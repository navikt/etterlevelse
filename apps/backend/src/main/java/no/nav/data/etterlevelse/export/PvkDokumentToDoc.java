package no.nav.data.etterlevelse.export;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.common.utils.ZipFile;
import no.nav.data.common.utils.ZipUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PvkDokumentToDoc {
    private static final ObjectFactory pvkFactory = Context.getWmlObjectFactory();

    private final PvkDokumentService pvkDokumentService;
    private final BehandlingensLivslopService behandlingensLivslopService;

    public byte[] generateDocFor (UUID pvkDokumentId) throws IOException {
        PvkDokument pvkDokument = pvkDokumentService.get(pvkDokumentId);
        Optional<BehandlingensLivslop> behandlingensLivslop = behandlingensLivslopService.getByEtterlevelseDokumentasjon(pvkDokument.getEtterlevelseDokumentId());

        var doc = new PvkDocumentBuilder();

        doc.addHeading1("Dokumentet inneholder personverkonsekvensvurdering");

        doc.generate(pvkDokument, behandlingensLivslop);

        byte[] pvkDoc = doc.build();

        ZipUtils zipUtils = new ZipUtils();
        List<ZipFile> zipFiles = new ArrayList<>();

        zipFiles.add(ZipFile.builder()
                        .filnavn("pvkDokument")
                        .filtype("docx")
                        .fil(pvkDoc)
                .build());

        behandlingensLivslop.ifPresent(livslop -> livslop.getBehandlingensLivslopData().getFiler().forEach(behandlingensLivslopFil -> {
            String[] filename = behandlingensLivslopFil.getFilnavn().split("\\.");
            zipFiles.add(ZipFile.builder()
                    .filnavn(filename[0])
                    .filtype(filename[1])
                    .fil(behandlingensLivslopFil.getFil())
                    .build());
        }));

        return zipUtils.zipOutputStream(zipFiles);
    }


    class PvkDocumentBuilder extends WordDocUtils {

        public PvkDocumentBuilder() {
            super(pvkFactory);
        }

        long listId = 1;

        public void generate(PvkDokument pvkDokument, Optional<BehandlingensLivslop> behandlingensLivslop) {

            long currListId = listId++;

            behandlingensLivslop.ifPresent(livslop -> addListItem("Behandlingens livsløp", currListId, livslop.getId().toString()));

            addListItem("Personverkonsekvensvurdering", currListId, pvkDokument.getId().toString());

            if (behandlingensLivslop.isPresent()) {
                var header = addHeading2("Behandlingens livsløp");

                addBookmark(header, behandlingensLivslop.get().getId().toString());

                addHeading3("Filer lastet opp:");
                if(behandlingensLivslop.get().getBehandlingensLivslopData().getFiler().isEmpty()) {
                    addText("Ingen fil lastet opp");
                } else {
                    behandlingensLivslop.get().getBehandlingensLivslopData().getFiler().forEach(fil -> {
                        addMarkdownText("- " + fil.getFilnavn());
                    });
                }


                addHeading3("Beskrivelse");
                if(behandlingensLivslop.get().getBehandlingensLivslopData().getBeskrivelse() != null && !behandlingensLivslop.get().getBehandlingensLivslopData().getBeskrivelse().isBlank()) {
                    addText(behandlingensLivslop.get().getBehandlingensLivslopData().getBeskrivelse());
                } else {
                    addText("Ingen skriftlig beskrivelse");
                }
            }

            var header = addHeading2("Personvernkonsekvensvurdering");

            addBookmark(header, pvkDokument.getId().toString());

            addHeading3("Status");
            addText(pvkDokumentStatusText(pvkDokument.getStatus()));

        }

        public String pvkDokumentStatusText(PvkDokumentStatus status) {
            return switch (status) {
                case AKTIV, UNDERARBEID -> "Under arbeid";
                case SENDT_TIL_PVO-> "Sendt til personvernombudet";
                case VURDERT_AV_PVO -> "Vurdert av personvernombudet";
                case TRENGER_GODKJENNING -> "Trenger godkjenning fra risikoeier";
                case GODKJENT_AV_RISIKOEIER -> "Godkjent av risikoeier";
            };
        }
    }
}
