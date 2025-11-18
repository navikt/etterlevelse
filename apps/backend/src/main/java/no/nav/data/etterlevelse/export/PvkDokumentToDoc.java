package no.nav.data.etterlevelse.export;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.ZipFile;
import no.nav.data.common.utils.ZipUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopData;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.krav.dto.RegelverkResponse;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.pvotilbakemelding.domain.*;
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
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

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
    private final EtterlevelseService etterlevelseService;

    public BehandlingensLivslop getBehandlingensLivslop(UUID etterlevelseDokumentasjonId) {
        return behandlingensLivslopService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId)
                .orElse(BehandlingensLivslop.builder()
                        .behandlingensLivslopData(BehandlingensLivslopData.builder()
                                .beskrivelse("")
                                .filer(List.of())
                                .build())
                        .build());
    }

    public PvoTilbakemelding getPvoTilbakemelding(UUID pvkDokumentId, int innsendingId) {
        return pvoTilbakemeldingService.getByPvkDokumentId(pvkDokumentId)
                .orElse(PvoTilbakemelding.builder()
                        .status(PvoTilbakemeldingStatus.UNDERARBEID)
                        .pvoTilbakemeldingData(PvoTilbakemeldingData.builder()
                                .vurderinger(List.of(Vurdering.builder()
                                        .innsendingId(innsendingId)
                                        .merknadTilEtterleverEllerRisikoeier("")
                                        .sendtDato(LocalDateTime.now())
                                        .behandlingenslivslop(buildEmptyTilbakemelding())
                                        .behandlingensArtOgOmfang(buildEmptyTilbakemelding())
                                        .innvolveringAvEksterne(buildEmptyTilbakemelding())
                                        .risikoscenarioEtterTiltakk(buildEmptyTilbakemelding())
                                        .build()))
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

    public byte[] generateZipWithBLLFilesFromDoc(byte[] pvkDokument, UUID etterlevelseDokumentasjonId, String documentTittle) throws IOException {
        ZipUtils zipUtils = new ZipUtils();
        List<ZipFile> zipFiles = new ArrayList<>();

        BehandlingensLivslop behandlingensLivslop = getBehandlingensLivslop(etterlevelseDokumentasjonId);

        zipFiles.add(ZipFile.builder()
                .filnavn(documentTittle)
                .filtype("docx")
                .fil(pvkDokument)
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

    public void generateDocForP360(EtterlevelseDokumentasjonToDoc.EtterlevelseDocumentBuilder doc, EtterlevelseDokumentasjon etterlevelseDokumentasjon) {
        PvkDokument pvkDokument = pvkDokumentService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjon.getId()).orElse(new PvkDokument());
        BehandlingensLivslop behandlingensLivslop = getBehandlingensLivslop(etterlevelseDokumentasjon.getId());
        PvoTilbakemelding pvoTilbakemelding = getPvoTilbakemelding(pvkDokument.getId(), pvkDokument.getPvkDokumentData().getAntallInnsendingTilPvo());
        Vurdering pvoVurdering = pvoTilbakemelding.getPvoTilbakemeldingData().getVurderinger()
                .stream().filter(vurdering -> vurdering.getInnsendingId() == pvkDokument.getPvkDokumentData().getAntallInnsendingTilPvo()).toList().getFirst();
        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjonResponse = EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjon);
        etterlevelseDokumentasjonService.addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(etterlevelseDokumentasjonResponse);

        var innsendingId = pvkDokument.getPvkDokumentData().getAntallInnsendingTilPvo();

        List<RisikoscenarioResponse> risikoscenarioList = getRisikoscenario(pvkDokument.getId().toString());
        List<TiltakResponse> tiltakList = getTiltak(pvkDokument.getId());

        List<Krav> pvkKrav = kravService.getByFilter(KravFilter.builder()
                        .gjeldendeKrav(true)
                        .tagger(List.of("Personvernkonsekvensvurdering"))
                        .etterlevelseDokumentasjonId(etterlevelseDokumentasjon.getId())
                .build());

        List<Etterlevelse> antallFerdigPvkKrav = new ArrayList<>();

        pvkKrav.forEach(krav -> {
           Optional<Etterlevelse> etterlevelse = etterlevelseService.getByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(etterlevelseDokumentasjon.getId(), krav.getKravNummer(), krav.getKravVersjon());
           if (etterlevelse.isPresent() && etterlevelse.get().getStatus() == EtterlevelseStatus.FERDIG_DOKUMENTERT) {
               antallFerdigPvkKrav.add(etterlevelse.get());
           }
        });

        long currListId = doc.listId++;

        doc.addHeading1("Personvernkonsekvensvurdering");
        doc.newLine();
        if (pvkDokument.getStatus() != PvkDokumentStatus.VURDERT_AV_PVO && pvkDokument.getStatus() != PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
            doc.addLabel("PVK dokument status");
            doc.addText(doc.pvkDokumentStatusText(pvkDokument.getStatus()));
            doc.newLine();
        }
        doc.newLine();
        doc.addLabel("Sendt inn av:");
        if (innsendingId == 0) {
            doc.addText("Ikke sendt til pvo");
        } else {
            var latestMeldingTilPvo = pvkDokument.getPvkDokumentData()
                    .getMeldingerTilPvo().stream()
                    .filter(meldingTilPvo -> meldingTilPvo.getInnsendingId() == innsendingId).toList().getFirst();
            doc.addText(latestMeldingTilPvo.getSendtTilPvoAv() + ", " +  doc.dateToString(latestMeldingTilPvo.getSendtTilPvoDato().toLocalDate()));
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
            String risikoeiere = "";
            List<String> risikoeierNameList = etterlevelseDokumentasjonResponse.getRisikoeiereData().stream().map(risikoeier -> risikoeier.getFullName() + ", ").toList();
            var nameListLength = risikoeierNameList.size();

            if (nameListLength > 1) {
                for (int i = 1; i <= nameListLength; i++) {
                    if (i == nameListLength - 1) {
                        risikoeiere = risikoeiere.concat("og ");
                    }
                    risikoeiere = risikoeiere.concat(risikoeierNameList.get(i));
                }
            } else {
                risikoeiere = risikoeiere.concat(risikoeierNameList.get(0));
            }


            doc.addText(
                    risikoeiere +
                            "den " + doc.dateToString(pvkDokument.getLastModifiedDate().toLocalDate())
            );
        } else {
            doc.addText("Ikke ferdig godkjent");
        }

        doc.newLine();

        doc.addHeading3("Personvernkonsekvensvurderingen inneholder:");
        doc.addListItem("Behandlingens livsløp", currListId, "Behandlingens_livsløp_bookmark");
        doc.addListItem("Bør vi gjøre en PVK?", currListId, "pvk_behov");
        doc.addListItem("Behandlingens art og omfang", currListId, "pvk_art_og_omfang");
        doc.addListItem("Tilhørende dokumentasjon", currListId, "pvk_tilhorende_dokumentasjon");
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
            doc.addMarkdownText(behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse());
        } else {
            doc.addText("Ingen skriftlig beskrivelse.");
        }
        doc.newLine();

        if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
            doc.generatePvoTilbakemelding(pvoVurdering.getBehandlingenslivslop());
        }

        doc.pageBreak();

        //PVK dokument
        var pvkBehovHeading = doc.addHeading2("Bør vi gjøre en PVK?");
        doc.addBookmark(pvkBehovHeading, "pvk_behov");
        doc.newLine();
        doc.generateEgenskaperFraBehandlinger(etterlevelseDokumentasjonResponse.getBehandlinger());
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
            doc.pageBreak();
        } else {
            doc.addText("Vi skal gjennomføre en PVK.");

            doc.newLine();

            doc.generateBehandlingensArtOgOmfang(pvkDokument, etterlevelseDokumentasjonResponse.getBehandlinger(), pvoTilbakemelding, pvoVurdering);
            doc.newLine();
            doc.generateTilhorendeDokumentasjon(etterlevelseDokumentasjonResponse, pvkKrav.size(), antallFerdigPvkKrav.size(), pvoTilbakemelding, pvoVurdering);
            doc.newLine();
            doc.generateInnvolveringAvEksterne(pvkDokument, etterlevelseDokumentasjonResponse.getBehandlinger(), pvoTilbakemelding, pvoVurdering);
            doc.newLine();
            doc.generateRisikoscenarioOgTiltak(risikoscenarioList, tiltakList, pvoTilbakemelding, pvoVurdering);
            doc.newLine();

            doc.addHeading2("Merknader ved oversending");
            doc.newLine();
            doc.addLabel("Beskjed fra etterlever til personvernombudet:");
            if (innsendingId == 0) {
                doc.addText("Ingen merknad");
            } else {
                var latestMeldingTilPvo = pvkDokument.getPvkDokumentData()
                        .getMeldingerTilPvo().stream()
                        .filter(meldingTilPvo -> meldingTilPvo.getInnsendingId() == innsendingId).toList().getFirst();
                if (latestMeldingTilPvo.getMerknadTilPvo().isEmpty()) {
                    doc.addText("Ingen merknad.");
                } else {
                    doc.addMarkdownText(latestMeldingTilPvo.getMerknadTilPvo());
                }
            }

            if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
                doc.addLabel("Beskjed til etterlever Fra personvernombudet:");
                if (pvoVurdering.getMerknadTilEtterleverEllerRisikoeier().isEmpty()) {
                    doc.addText("Ingen merknad.");
                } else {
                    doc.addMarkdownText(pvoVurdering.getMerknadTilEtterleverEllerRisikoeier());
                }

                doc.newLine();
                doc.addLabel("Tilbakemelding til etterlever:");
                doc.newLine();
                doc.addLabel("Beskjed til etterlever");
                doc.newLine();
                if (pvoVurdering.getMerknadTilEtterleverEllerRisikoeier().isEmpty()) {
                    doc.addText("Ingen merknad.");
                } else {
                    doc.addMarkdownText(pvoVurdering.getMerknadTilEtterleverEllerRisikoeier());
                }
                doc.newLine();
                doc.addBooleanDataText("Anbefales det at arbeidet går videre som planlagt?", pvoVurdering.getArbeidGarVidere());
                doc.newLine();
                doc.addLabel("Beskriv anbefalingen nærmere:");
                if (pvoVurdering.getArbeidGarVidereBegrunnelse() == null || pvoVurdering.getArbeidGarVidereBegrunnelse().isEmpty()) {
                    doc.addText("Ingen merknad.");
                } else {
                    doc.addMarkdownText(pvoVurdering.getArbeidGarVidereBegrunnelse());
                }
                doc.newLine();
                doc.addBooleanDataText("Er det behov for forhåndskonsultasjon med Datatilsynet?", pvoVurdering.getBehovForForhandskonsultasjon());
                doc.newLine();
                doc.addLabel("Beskriv anbefalingen nærmere:");
                if (pvoVurdering.getBehovForForhandskonsultasjonBegrunnelse() == null || pvoVurdering.getBehovForForhandskonsultasjonBegrunnelse().isEmpty()) {
                    doc.addText("Ingen merknad.");
                } else {
                    doc.addMarkdownText(pvoVurdering.getBehovForForhandskonsultasjonBegrunnelse());
                }
                doc.newLine();

                doc.addLabel("Personvernombudets vurdering");
                doc.addText(CodelistService.getCodelist(ListName.PVO_VURDERING, pvoVurdering.getPvoVurdering()).getDescription());
                doc.newLine();
                doc.addBooleanDataText("PVO vil følge opp endringer dere gjør.", pvoVurdering.getPvoFolgeOppEndringer());
                doc.newLine();
                doc.addBooleanDataText("PVO vil få PVK i retur etter at dere har gjennomgått tilbakemeldinger.", pvoVurdering.getVilFaPvkIRetur());
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
            doc.pageBreak();
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
}
