package no.nav.data.etterlevelse.export;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.common.utils.ZipFile;
import no.nav.data.common.utils.ZipUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.behandling.dto.PolicyResponse;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Service
@RequiredArgsConstructor
public class PvkDokumentToDoc {
    private static final ObjectFactory pvkFactory = Context.getWmlObjectFactory();

    private final PvkDokumentService pvkDokumentService;
    private final BehandlingensLivslopService behandlingensLivslopService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final BehandlingService behandlingService;

    public byte[] generateDocFor(UUID pvkDokumentId) throws IOException {
        PvkDokument pvkDokument = pvkDokumentService.get(pvkDokumentId);
        Optional<BehandlingensLivslop> behandlingensLivslop = behandlingensLivslopService.getByEtterlevelseDokumentasjon(pvkDokument.getEtterlevelseDokumentId());
        var etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId());
        List<Behandling> behandlingList = new ArrayList<>();
        etterlevelseDokumentasjon.getBehandlingIds().forEach(id -> {
            try {
                var behandling = behandlingService.getBehandling(id);
                    behandlingList.add(behandling);
                } catch (WebClientResponseException.NotFound e) {
                    behandlingList.add(Behandling.builder()
                            .id(id)
                            .navn("Fant ikke behandling med id: " + id)
                            .build());
                }
            });

        var doc = new PvkDocumentBuilder();

        doc.addHeading1("Dokumentet inneholder personverkonsekvensvurdering");

        doc.generate(pvkDokument, behandlingensLivslop, behandlingList);

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

        public void generate(PvkDokument pvkDokument, Optional<BehandlingensLivslop> behandlingensLivslop, List<Behandling> behandlingList) {

            long currListId = listId++;

            behandlingensLivslop.ifPresent(livslop -> addListItem("Behandlingens livsløp", currListId, livslop.getId().toString()));

            addListItem("Personverkonsekvensvurdering", currListId, pvkDokument.getId().toString());
            pageBreak();

            if (behandlingensLivslop.isPresent()) {
                var header = addHeading2("Behandlingens livsløp");

                addBookmark(header, behandlingensLivslop.get().getId().toString());

                addHeading3("Filer lastet opp:");
                if (behandlingensLivslop.get().getBehandlingensLivslopData().getFiler().isEmpty()) {
                    addText("Ingen fil lastet opp");
                } else {
                    behandlingensLivslop.get().getBehandlingensLivslopData().getFiler().forEach(fil -> {
                        addMarkdownText("- " + fil.getFilnavn());
                    });
                }


                addHeading3("Beskrivelse");
                if (behandlingensLivslop.get().getBehandlingensLivslopData().getBeskrivelse() != null && !behandlingensLivslop.get().getBehandlingensLivslopData().getBeskrivelse().isBlank()) {
                    addText(behandlingensLivslop.get().getBehandlingensLivslopData().getBeskrivelse());
                } else {
                    addText("Ingen skriftlig beskrivelse");
                }
                pageBreak();
            }

            var header = addHeading2("Personvernkonsekvensvurdering");

            addBookmark(header, pvkDokument.getId().toString());
            generateEgenskaperFraBehandlinger(behandlingList);

            generateOvrigeEgenskaperFraBehandlinger(pvkDokument);

            addHeading3("Hvilken vurdering har dere kommet fram til?");
            if (pvkDokument.getPvkDokumentData().getSkalUtforePvk() == null) {
                addText("Ingen vurdering");
            } else if (!pvkDokument.getPvkDokumentData().getSkalUtforePvk()) {
                addText("Vi skal ikke gjennomføre PVK");

                addHeading3("Begrunnelse av vurderingen");
                addText(pvkDokument.getPvkDokumentData().getPvkVurderingsBegrunnelse());
            } else {
                addText("Vi skal gjennomføre en PVK");

                addHeading3("Status");
                addText(pvkDokumentStatusText(pvkDokument.getStatus()));
            }
        }

        public void generateOvrigeEgenskaperFraBehandlinger(PvkDokument pvkDokument) {
            var allYtterligeEgenskaper = CodelistService.getCodelist(ListName.YTTERLIGERE_EGENSKAPER);

            addHeading3("Øvrige egenskaper for behandlingene:");

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
                if(behandling.getPolicies().isEmpty()) {
                    manglerOpplysningstyper.set(true);
                } else {
                    alleOpplysningstyper.addAll(behandling.getPolicies());
                }

                alleProfilering.add(behandling.getProfilering());
                alleAutomatiskBehandling.add(behandling.getAutomatiskBehandling());
            });

            var saerligKategorierOppsumert = alleOpplysningstyper.stream().filter(type -> type.getSensitivity().getCode().equals("SAERLIGE")).toList();

            addHeading3("Følgende egenskaper er hentet fra Behandlingskatalogen:");
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
            } else if (!manglerOpplysningstyper.get() &&  saerligKategorierOppsumert.isEmpty()) {
                addMarkdownText("- **Det gjelder ikke** saerlig kategorier");
            } else if (manglerOpplysningstyper.get()) {
                addMarkdownText("- Mangler informasjon for å vite saerlig kategorier");
            }

        }


        public String pvkDokumentStatusText(PvkDokumentStatus status) {
            return switch (status) {
                case AKTIV, UNDERARBEID -> "Under arbeid";
                case SENDT_TIL_PVO -> "Sendt til personvernombudet";
                case VURDERT_AV_PVO -> "Vurdert av personvernombudet";
                case TRENGER_GODKJENNING -> "Trenger godkjenning fra risikoeier";
                case GODKJENT_AV_RISIKOEIER -> "Godkjent av risikoeier";
            };
        }
    }
}
