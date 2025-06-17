package no.nav.data.etterlevelse.export;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.common.utils.ZipFile;
import no.nav.data.common.utils.ZipUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopData;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.dto.RegelverkResponse;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingData;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingStatus;
import no.nav.data.pvk.pvotilbakemelding.domain.Tilbakemeldingsinnhold;
import no.nav.data.pvk.risikoscenario.RisikoscenarioService;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import no.nav.data.pvk.tiltak.TiltakService;
import no.nav.data.pvk.tiltak.dto.TiltakResponse;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PvkDokumentToDoc {
    private static final ObjectFactory pvkFactory = Context.getWmlObjectFactory();

    private final PvkDokumentService pvkDokumentService;
    private final BehandlingensLivslopService behandlingensLivslopService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final RisikoscenarioService risikoscenarioService;
    private final PvoTilbakemeldingService pvoTilbakemeldingService;
    private final TiltakService tiltakService;
    private final KravService kravService;

    public BehandlingensLivslop getBehandlingensLivslop(UUID etterlevelseDokumentasjonId) {
        return behandlingensLivslopService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId)
                .orElse(BehandlingensLivslop.builder()
                        .behandlingensLivslopData(BehandlingensLivslopData.builder()
                                .beskrivelse("")
                                .filer(List.of())
                                .build())
                        .build());
    }

    public PvoTilbakemelding getPvoTilbakemelding(UUID pvkDokumentId) {
        return pvoTilbakemeldingService.getByPvkDokumentId(pvkDokumentId)
                .orElse(PvoTilbakemelding.builder()
                        .status(PvoTilbakemeldingStatus.UNDERARBEID)
                        .pvoTilbakemeldingData(PvoTilbakemeldingData.builder()
                                .merknadTilEtterleverEllerRisikoeier("")
                                .sendtDato(LocalDateTime.now())
                                .behandlingenslivslop(buildEmptyTilbakemelding())
                                .behandlingensArtOgOmfang(buildEmptyTilbakemelding())
                                .innvolveringAvEksterne(buildEmptyTilbakemelding())
                                .risikoscenarioEtterTiltakk(buildEmptyTilbakemelding())
                                .build())
                        .build());
    }

    public List<RisikoscenarioResponse> getRisikoscenario(String pvkDokumentId) {
        List<RisikoscenarioResponse> risikoscenarioList = new ArrayList<>(
                risikoscenarioService.getByPvkDokument(pvkDokumentId, RisikoscenarioType.ALL)
                        .stream().map(RisikoscenarioResponse::buildFrom).toList());

        risikoscenarioList.forEach(risikoscenario -> {
            risikoscenario.setTiltakIds(risikoscenarioService.getTiltak(risikoscenario.getId()));
            if (!risikoscenario.isGenerelScenario()) {
                risikoscenario.getRelevanteKravNummer().forEach(kravShort -> {
                    List<Krav> kravList = kravService.findByKravNummerAndActiveStatus(kravShort.getKravNummer());
                    try {
                        RegelverkResponse regelverk = kravList.get(0).getRegelverk().get(0).toResponse();
                        JsonNode lovData = regelverk.getLov().getData();
                        kravShort.setTemaCode(lovData.get("tema").asText());
                    } catch (RuntimeException e) {
                        // Ignore. If something went wrong (IOOBE or NPE), temaCode is not set.
                    }
                    kravShort.setKravVersjon(kravList.get(0).getKravVersjon());
                    kravShort.setNavn(kravList.get(0).getNavn());
                });
            }
        });

        risikoscenarioList.sort(( a,  b) -> {
            if (a.isGenerelScenario() && !b.isGenerelScenario()) {
                return 1;
            } else if (!a.isGenerelScenario() && b.isGenerelScenario()) {
                return -1;
            } else {
                return 0;
            }
        });

        return risikoscenarioList;
    }

    public List<TiltakResponse> getTiltak(UUID pvkDokumentId) {
        List<TiltakResponse> tiltakList = tiltakService.getByPvkDokument(pvkDokumentId).stream().map(TiltakResponse::buildFrom).toList();

        tiltakList.forEach(tiltak -> {
            tiltak.setRisikoscenarioIds(tiltakService.getRisikoscenarioer(tiltak.getId()));
        });

        return tiltakList;
    }

    public byte[] generateDocFor(UUID pvkDokumentId) throws IOException {
        PvkDokument pvkDokument = pvkDokumentService.get(pvkDokumentId);

        BehandlingensLivslop behandlingensLivslop = getBehandlingensLivslop(pvkDokument.getEtterlevelseDokumentId());
        PvoTilbakemelding pvoTilbakemelding = getPvoTilbakemelding(pvkDokument.getId());

        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon = EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId()));
        etterlevelseDokumentasjonService.addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(etterlevelseDokumentasjon);

        List<RisikoscenarioResponse> risikoscenarioList = getRisikoscenario(pvkDokument.getId().toString());

        List<TiltakResponse> tiltakList = getTiltak(pvkDokument.getId());

        var doc = new PvkDocumentBuilder();

        doc.generate(pvkDokument, etterlevelseDokumentasjon, behandlingensLivslop, risikoscenarioList, tiltakList, pvoTilbakemelding);

        byte[] pvkDoc = doc.build();

        ZipUtils zipUtils = new ZipUtils();
        List<ZipFile> zipFiles = new ArrayList<>();

        zipFiles.add(ZipFile.builder()
                .filnavn("pvkDokument")
                .filtype("docx")
                .fil(pvkDoc)
                .build());

        behandlingensLivslop.getBehandlingensLivslopData().getFiler().forEach(behandlingensLivslopFil -> {
            String[] filename = behandlingensLivslopFil.getFilnavn().split("\\.");
            zipFiles.add(ZipFile.builder()
                    .filnavn(filename[0])
                    .filtype(filename[1])
                    .fil(behandlingensLivslopFil.getFil())
                    .build());
        });

        return zipUtils.zipOutputStream(zipFiles);
    }

    public void generateDocForP360(EtterlevelseDokumentasjonToDoc.EtterlevelseDocumentBuilder doc, EtterlevelseDokumentasjon EtterlevelseDokumentasjon) {
        PvkDokument pvkDokument = pvkDokumentService.getByEtterlevelseDokumentasjon(EtterlevelseDokumentasjon.getId()).orElse(new PvkDokument());
        BehandlingensLivslop behandlingensLivslop = getBehandlingensLivslop(pvkDokument.getEtterlevelseDokumentId());
        PvoTilbakemelding pvoTilbakemelding = getPvoTilbakemelding(pvkDokument.getId());

        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon = EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjonService.get(EtterlevelseDokumentasjon.getId()));
        etterlevelseDokumentasjonService.addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(etterlevelseDokumentasjon);

        List<RisikoscenarioResponse> risikoscenarioList = getRisikoscenario(pvkDokument.getId().toString());
        List<TiltakResponse> tiltakList = getTiltak(pvkDokument.getId());


        long currListId = doc.listId++;

        doc.addHeading1("Personverkonsekvensvurdering");
        doc.newLine();
        if (pvkDokument.getStatus() != PvkDokumentStatus.VURDERT_AV_PVO && pvkDokument.getStatus() != PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
            doc.addLabel("PVK dokument status");
            doc.addText(doc.pvkDokumentStatusText(pvkDokument.getStatus()));
            doc.newLine();
        }
        doc.newLine();
        doc.addLabel("Sendt inn av:");
        if (pvkDokument.getPvkDokumentData().getSendtTilPvoDato() == null) {
            doc.addText("Ikke sendt til pvo");
        } else {
            doc.addText(pvkDokument.getPvkDokumentData().getSendtTilPvoAv() + ", " +  doc.dateToString(pvkDokument.getPvkDokumentData().getSendtTilPvoDato().toLocalDate()));
        }
        doc.newLine();
        doc.addLabel("Vurdert av personvernombudet:");
        if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
            doc.addText(pvoTilbakemelding.getLastModifiedBy().split(" - ")[1] + ", den " +  doc.dateToString(pvoTilbakemelding.getLastModifiedDate().toLocalDate()));
        } else {
            doc.addText("Ikke ferdig vurdert");
        }
        doc.newLine();
        doc.addLabel("Godkjent av risikoeier:");
        if (pvkDokument.getStatus() == PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
            doc.addText(
                    etterlevelseDokumentasjon.getRisikoeiereData().stream().map(risikoeier -> risikoeier.getFullName() + ", ") +
                            "den " + doc.dateToString(pvkDokument.getLastModifiedDate().toLocalDate())
            );
        } else {
            doc.addText("Ikke ferdig godkjent");
        }

        doc.newLine();

        doc.addListItem("Behandlingens livsløp", currListId, "Behandlingens_livsløp_bookmark");
        doc.addListItem("Bør vi gjøre en PVK?", currListId, "pvk_behov");
        doc.addListItem("Behandlingens art og omfang", currListId, "pvk_art_og_omfang");
        doc.addListItem("Innvolvering av eksterne", currListId, "pvk_innvolvering_av_ekstern");
        doc.addListItem("Risikoscenario og tiltak", currListId, "pvk_risikoscenario_og_tiltak");

        doc.pageBreak();

        //Behandlingens livslop
        var BLLheader = doc.addHeading2("Behandlingens livsløp");

        doc.addBookmark(BLLheader, "Behandlingens_livsløp_bookmark");
        doc.newLine();


        doc.addLabel("Opplastede filer:");
        if (behandlingensLivslop.getBehandlingensLivslopData().getFiler().isEmpty()) {
            doc.addText("Ingen fil lastet opp.");
        } else {
            behandlingensLivslop.getBehandlingensLivslopData().getFiler().forEach(fil -> {
                doc.addMarkdownText("- " + fil.getFilnavn());
            });
        }

        doc.newLine();

        doc.addLabel("Skriftlig beskrivelse");
        if (behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse() != null && !behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse().isBlank()) {
            doc.addText(behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse());
        } else {
            doc.addText("Ingen skriftlig beskrivelse.");
        }
        doc.newLine();
        doc.generatePvoTilbakemelding(pvoTilbakemelding.getPvoTilbakemeldingData().getBehandlingenslivslop());

        doc.pageBreak();

        //PVK dokument
        var pvkBehovHeading = doc.addHeading2("Bør vi gjøre en PVK?");
        doc.addBookmark(pvkBehovHeading, "pvk_behov");
        doc.newLine();
        doc.generateEgenskaperFraBehandlinger(etterlevelseDokumentasjon.getBehandlinger());
        doc.newLine();
        doc.generateOvrigeEgenskaperFraBehandlinger(pvkDokument);
        doc.newLine();

        doc.addLabel("Hvilken vurdering har dere kommet fram til?");
        if (pvkDokument.getPvkDokumentData().getSkalUtforePvk() == null) {
            doc.addText("Ingen vurdering");
        } else if (!pvkDokument.getPvkDokumentData().getSkalUtforePvk()) {
            doc.addText("Vi skal ikke gjennomføre PVK.");
            doc.newLine();
            doc.addHeading4("Begrunnelse av vurderingen");
            doc.addText(pvkDokument.getPvkDokumentData().getPvkVurderingsBegrunnelse());
            doc.newLine();
        } else {
            doc.addText("Vi skal gjennomføre en PVK.");

            doc.newLine();

            doc.generateBehandlingensArtOgOmfang(pvkDokument, etterlevelseDokumentasjon.getBehandlinger(), pvoTilbakemelding);
            doc.newLine();
            doc.generateInnvolveringAvEksterne(pvkDokument, etterlevelseDokumentasjon.getBehandlinger(), pvoTilbakemelding);
            doc.newLine();
            doc.generateRisikoscenarioOgTiltak(risikoscenarioList, tiltakList, pvoTilbakemelding);
            doc.newLine();

            doc.addHeading2("Merknader ved oversending");
            doc.newLine();
            doc.addLabel("Beskjed fra etterlever til personvernombudet:");

            if (pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier().isEmpty()) {
                doc.addText("Ingen merknad.");
            } else {
                doc.addMarkdownText(pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier());
            }

            doc.newLine();

            doc.addLabel("Beskjed fra personvernombudet til etterlever:");
            doc.newLine();
            doc.addBooleanDataText("Anbefales det at arbeidet går videre som planlagt?", pvoTilbakemelding.getPvoTilbakemeldingData().getArbeidGarVidere());
            doc.newLine();
            doc.addBooleanDataText("Er det behov for forhåndskonsultasjon med Datatilsynet?", pvoTilbakemelding.getPvoTilbakemeldingData().getBehovForForhandskonsultasjon());
            doc.newLine();
            doc.addLabel("Er det noe annet dere ønsker å formidle til etterlever?");
            if (pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier().isEmpty()) {
                doc.addText("Ingen merknad.");
            } else {
                doc.addMarkdownText(pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier());
            }

            doc.newLine();

            doc.addLabel("Kommentar fra etterlever til risikoeier:");
            if (pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier() == null || pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier().isEmpty()) {
                doc.addText("Ingen merknad.");
            } else {
                doc.addMarkdownText(pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier());
            }
            doc.newLine();

            doc.addLabel("Risikoeierens kommmentarer:");
            if (pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier() == null || pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier().isEmpty()) {
                doc.addText("Ingen merknad.");
            } else {
                doc.addMarkdownText(pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier());
            }
        }
    }

    private Tilbakemeldingsinnhold buildEmptyTilbakemelding() {
        return Tilbakemeldingsinnhold.builder()
                .bidragsVurdering("")
                .internDiskusjon("")
                .tilbakemeldingTilEtterlevere("")
                .sistRedigertAv("")
                .sistRedigertDato(LocalDateTime.now())
                .build();
    }


    class PvkDocumentBuilder extends WordDocUtils {

        public PvkDocumentBuilder() {
            super(pvkFactory);
        }

        long listId = 1;

        public void generate(PvkDokument pvkDokument, EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon, BehandlingensLivslop behandlingensLivslop, List<RisikoscenarioResponse> risikoscenarioList, List<TiltakResponse> tiltakList, PvoTilbakemelding pvoTilbakemelding) {

            long currListId = listId++;

            addHeading1("Personverkonsekvensvurdering");
            newLine();
            if (pvkDokument.getStatus() != PvkDokumentStatus.VURDERT_AV_PVO && pvkDokument.getStatus() != PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
                addLabel("PVK dokument status");
                addText(pvkDokumentStatusText(pvkDokument.getStatus()));
                newLine();
            }
            newLine();
            addLabel("Sendt inn av:");
            if (pvkDokument.getPvkDokumentData().getSendtTilPvoDato() == null) {
                addText("Ikke sendt til pvo");
            } else {
                addText(pvkDokument.getPvkDokumentData().getSendtTilPvoAv() + ", " + dateToString(pvkDokument.getPvkDokumentData().getSendtTilPvoDato().toLocalDate()));
            }
            newLine();
            addLabel("Vurdert av personvernombudet:");
            if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
                addText(pvoTilbakemelding.getLastModifiedBy().split(" - ")[1] + ", den " + dateToString(pvoTilbakemelding.getLastModifiedDate().toLocalDate()));
            } else {
                addText("Ikke ferdig vurdert");
            }
            newLine();
            addLabel("Godkjent av risikoeier:");
            if (pvkDokument.getStatus() == PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
                addText(
                        etterlevelseDokumentasjon.getRisikoeiereData().stream().map(risikoeier -> risikoeier.getFullName() + ", ") +
                        "den " + dateToString(pvkDokument.getLastModifiedDate().toLocalDate())
                );
            } else {
                addText("Ikke ferdig godkjent");
            }

            newLine();

            addListItem("Behandlingens livsløp", currListId, "Behandlingens_livsløp_bookmark");
            addListItem("Bør vi gjøre en PVK?", currListId, "pvk_behov");
            addListItem("Behandlingens art og omfang", currListId, "pvk_art_og_omfang");
            addListItem("Innvolvering av eksterne", currListId, "pvk_innvolvering_av_ekstern");
            addListItem("Risikoscenario og tiltak", currListId, "pvk_risikoscenario_og_tiltak");

            pageBreak();

            //Behandlingens livslop
            var BLLheader = addHeading2("Behandlingens livsløp");

            addBookmark(BLLheader, "Behandlingens_livsløp_bookmark");
            newLine();


            addLabel("Opplastede filer:");
            if (behandlingensLivslop.getBehandlingensLivslopData().getFiler().isEmpty()) {
                addText("Ingen fil lastet opp.");
            } else {
                behandlingensLivslop.getBehandlingensLivslopData().getFiler().forEach(fil -> {
                    addMarkdownText("- " + fil.getFilnavn());
                });
            }

            newLine();

            addLabel("Skriftlig beskrivelse");
            if (behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse() != null && !behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse().isBlank()) {
                addText(behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse());
            } else {
                addText("Ingen skriftlig beskrivelse.");
            }
            newLine();
            generatePvoTilbakemelding(pvoTilbakemelding.getPvoTilbakemeldingData().getBehandlingenslivslop());

            pageBreak();

            //PVK dokument
            var pvkBehovHeading = addHeading2("Bør vi gjøre en PVK?");
            addBookmark(pvkBehovHeading, "pvk_behov");
            newLine();
            generateEgenskaperFraBehandlinger(etterlevelseDokumentasjon.getBehandlinger());
            newLine();
            generateOvrigeEgenskaperFraBehandlinger(pvkDokument);
            newLine();

            addLabel("Hvilken vurdering har dere kommet fram til?");
            if (pvkDokument.getPvkDokumentData().getSkalUtforePvk() == null) {
                addText("Ingen vurdering");
            } else if (!pvkDokument.getPvkDokumentData().getSkalUtforePvk()) {
                addText("Vi skal ikke gjennomføre PVK.");
                newLine();
                addHeading4("Begrunnelse av vurderingen");
                addText(pvkDokument.getPvkDokumentData().getPvkVurderingsBegrunnelse());
                newLine();
            } else {
                addText("Vi skal gjennomføre en PVK.");

                newLine();

                generateBehandlingensArtOgOmfang(pvkDokument, etterlevelseDokumentasjon.getBehandlinger(), pvoTilbakemelding);
                newLine();
                generateInnvolveringAvEksterne(pvkDokument, etterlevelseDokumentasjon.getBehandlinger(), pvoTilbakemelding);
                newLine();
                generateRisikoscenarioOgTiltak(risikoscenarioList, tiltakList, pvoTilbakemelding);
                newLine();

                addHeading2("Merknader ved oversending");
                newLine();
                addLabel("Beskjed fra etterlever til personvernombudet:");

                if (pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier().isEmpty()) {
                    addText("Ingen merknad.");
                } else {
                    addMarkdownText(pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier());
                }

                newLine();

                addLabel("Beskjed fra personvernombudet til etterlever:");
                newLine();
                addBooleanDataText("Anbefales det at arbeidet går videre som planlagt?", pvoTilbakemelding.getPvoTilbakemeldingData().getArbeidGarVidere());
                newLine();
                addBooleanDataText("Er det behov for forhåndskonsultasjon med Datatilsynet?", pvoTilbakemelding.getPvoTilbakemeldingData().getBehovForForhandskonsultasjon());
                newLine();
                addLabel("Er det noe annet dere ønsker å formidle til etterlever?");
                if (pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier().isEmpty()) {
                    addText("Ingen merknad.");
                } else {
                    addMarkdownText(pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier());
                }

                newLine();

                addLabel("Kommentar fra etterlever til risikoeier:");
                if (pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier() == null || pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier().isEmpty()) {
                    addText("Ingen merknad.");
                } else {
                    addMarkdownText(pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier());
                }
                newLine();

                addLabel("Risikoeierens kommmentarer:");
                if (pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier() == null || pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier().isEmpty()) {
                    addText("Ingen merknad.");
                } else {
                    addMarkdownText(pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier());
                }
            }
        }


    }
}
