package no.nav.data.etterlevelse.export;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.common.utils.ZipFile;
import no.nav.data.common.utils.ZipUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.BehandlingensLivslopService;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopData;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.common.domain.ExternalCode;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.behandling.dto.DataBehandler;
import no.nav.data.integration.behandling.dto.PolicyResponse;
import no.nav.data.integration.team.dto.Resource;
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
import org.apache.commons.lang3.BooleanUtils;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

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
    private final BehandlingService behandlingService;

    public byte[] generateDocFor(UUID pvkDokumentId) throws IOException {
        PvkDokument pvkDokument = pvkDokumentService.get(pvkDokumentId);

        BehandlingensLivslop behandlingensLivslop = behandlingensLivslopService.getByEtterlevelseDokumentasjon(pvkDokument.getEtterlevelseDokumentId())
                .orElse(BehandlingensLivslop.builder()
                        .behandlingensLivslopData(BehandlingensLivslopData.builder()
                                .beskrivelse("")
                                .filer(List.of())
                                .build())
                        .build());
        PvoTilbakemelding pvoTilbakemelding = pvoTilbakemeldingService.getByPvkDokumentId(pvkDokumentId)
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

        EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon = EtterlevelseDokumentasjonResponse.buildFrom(etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId()));
        etterlevelseDokumentasjonService.addBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(etterlevelseDokumentasjon);

        List<RisikoscenarioResponse> risikoscenarioList = risikoscenarioService.getByPvkDokument(pvkDokument.getId().toString(), RisikoscenarioType.ALL)
                .stream().map(RisikoscenarioResponse::buildFrom).toList();

        risikoscenarioList.forEach(risikoscenario -> {
            risikoscenario.setTiltakIds(risikoscenarioService.getTiltak(risikoscenario.getId()));
        });

        List<TiltakResponse> tiltakList = tiltakService.getByPvkDokument(pvkDokument.getId()).stream().map(TiltakResponse::buildFrom).toList();

        tiltakList.forEach(tiltak -> {
            tiltak.setRisikoscenarioIds(tiltakService.getRisikoscenarioer(tiltak.getId()));
        });

        var doc = new PvkDocumentBuilder();

        doc.addHeading1("Dokumentet inneholder personverkonsekvensvurdering");

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

            addHeading2("Behandlingens livsløp");
            addListItem("Dokumentasjon", currListId, "Behandlingens_livsløp_bookmark");
            newLine();
            addHeading2("Personverkonsekvensvurdering");
            addListItem("Bør vi gjøre en PVK?", currListId, "pvk_behov");
            addListItem("Behandlingens art og omfang", currListId, "pvk_art_og_omfang");
            addListItem("Innvolvering av eksterne", currListId, "pvk_innvolvering_av_ekstern");
            addListItem("Risikoscenario og tiltak", currListId, "pvk_risikoscenario_og_tiltak");

            pageBreak();

            //Behandlingens livslop
            var BLLheader = addHeading2("Behandlingens livsløp");

            addBookmark(BLLheader, "Behandlingens_livsløp_bookmark");
            newLine();


            addHeading3("Filer lastet opp:");
            if (behandlingensLivslop.getBehandlingensLivslopData().getFiler().isEmpty()) {
                addText("Ingen fil lastet opp");
            } else {
                behandlingensLivslop.getBehandlingensLivslopData().getFiler().forEach(fil -> {
                    addMarkdownText("- " + fil.getFilnavn());
                });
            }

            newLine();

            addHeading3("Beskrivelse");
            if (behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse() != null && !behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse().isBlank()) {
                addText(behandlingensLivslop.getBehandlingensLivslopData().getBeskrivelse());
            } else {
                addText("Ingen skriftlig beskrivelse");
            }

            generatePvoTilbakemelding(pvoTilbakemelding.getPvoTilbakemeldingData().getBehandlingenslivslop());

            pageBreak();

            //PVK dokument
            addHeading2("Personvernkonsekvensvurdering");
            newLine();
            addHeading4("PVK dokument status");
            if (pvkDokument.getStatus() != PvkDokumentStatus.VURDERT_AV_PVO && pvkDokument.getStatus() != PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
                addText(pvkDokumentStatusText(pvkDokument.getStatus()));
                newLine();
            }

            if (pvoTilbakemelding.getStatus() == PvoTilbakemeldingStatus.FERDIG) {
                addText("Vurdert av personvernombudet: " + pvoTilbakemelding.getLastModifiedBy() + ", den " + dateToString(pvoTilbakemelding.getLastModifiedDate().toLocalDate()));
            } else {
                addText("Vurdert av personvernombudet: Ikke ferdig vurdert");
            }

            if (pvkDokument.getStatus() == PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
                addText("Godkjent av risikoeier: " +
                        etterlevelseDokumentasjon.getRisikoeiereData().stream().map(risikoeier -> risikoeier.getFullName() + ", ") +
                        "den " + dateToString(pvkDokument.getLastModifiedDate().toLocalDate())
                );
            } else {
                addText("Godkjent av risikoeier: Ikke ferdig godkjent");
            }


            newLine();
            var header3 = addHeading3("Bør vi gjøre en PVK?");
            addBookmark(header3, "pvk_behov");
            newLine();
            generateEgenskaperFraBehandlinger(etterlevelseDokumentasjon.getBehandlinger());
            newLine();
            generateOvrigeEgenskaperFraBehandlinger(pvkDokument);
            newLine();

            addHeading4("Hvilken vurdering har dere kommet fram til?");
            if (pvkDokument.getPvkDokumentData().getSkalUtforePvk() == null) {
                addText("Ingen vurdering");
            } else if (!pvkDokument.getPvkDokumentData().getSkalUtforePvk()) {
                addText("Vi skal ikke gjennomføre PVK");
                newLine();
                addHeading4("Begrunnelse av vurderingen");
                addText(pvkDokument.getPvkDokumentData().getPvkVurderingsBegrunnelse());
                newLine();
            } else {
                addText("Vi skal gjennomføre en PVK");

                newLine();

                generateBehandlingensArtOgOmfang(pvkDokument, etterlevelseDokumentasjon.getBehandlinger(), pvoTilbakemelding);
                newLine();
                generateInnvolveringAvEksterne(pvkDokument, etterlevelseDokumentasjon.getBehandlinger(), pvoTilbakemelding);
                newLine();
                generateRisikoscenarioOgTiltak(risikoscenarioList, tiltakList, pvoTilbakemelding);
                newLine();

                addHeading3("Beskjed til personvernombudet");

                if (pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier().isEmpty()) {
                    addText("Ingen merknad");
                } else {
                    addMarkdownText(pvoTilbakemelding.getPvoTilbakemeldingData().getMerknadTilEtterleverEllerRisikoeier());
                }

                newLine();

                addHeading3("Beskjed til etterlever");
                if (pvkDokument.getPvkDokumentData().getMerknadTilPvoEllerRisikoeier().isEmpty()) {
                    addText("Ingen merknad");
                } else {
                    addMarkdownText(pvkDokument.getPvkDokumentData().getMerknadTilPvoEllerRisikoeier());
                }

                newLine();

                addHeading3("Kommentar til risikoeier");
                if (pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier() == null || pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier().isEmpty()) {
                    addText("Ingen merknad");
                } else {
                    addMarkdownText(pvkDokument.getPvkDokumentData().getMerknadTilRisikoeier());
                }
                newLine();

                addHeading3("Risikoeierens kommmentarer");
                if (pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier() == null || pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier().isEmpty()) {
                    addText("Ingen merknad");
                } else {
                    addMarkdownText(pvkDokument.getPvkDokumentData().getMerknadFraRisikoeier());
                }
            }
        }

        private void generateBehandlingensArtOgOmfang(PvkDokument pvkDokument, List<Behandling> behandlingList, PvoTilbakemelding pvoTilbakemelding) {
            newLine();
            var header3 = addHeading3("Behandlingens art og omfang");
            addBookmark(header3, "pvk_art_og_omfang");
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

        private void generateInnvolveringAvEksterne(PvkDokument pvkDokument, List<Behandling> behandlingList, PvoTilbakemelding pvoTilbakemelding) {
            newLine();
            var header3 = addHeading3("Innvolvering av eksterne");
            addBookmark(header3, "pvk_innvolvering_av_ekstern");

            newLine();
            addHeading4("Representanter for de registrerte");
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

        private void generateRisikoscenarioOgTiltak(List<RisikoscenarioResponse> risikoscenarioList, List<TiltakResponse> tiltakList, PvoTilbakemelding pvoTilbakemelding) {
            newLine();
            var header3 = addHeading3("Risikoscenario og tiltak");
            addBookmark(header3, "pvk_risikoscenario_og_tiltak");

            newLine();
            addHeading4("Liste over risikoscenario og tiltak");
            newLine();
            risikoscenarioList.forEach(risikoscenario -> {
                addHeading4(risikoscenario.getNavn());
                addMarkdownText("**Status**: " + getRisikoscenarioStatus(risikoscenario));
                newLine();
                addHeading5("Beskrivelse");
                if (risikoscenario.getBeskrivelse().isEmpty()) {
                    addText("Ikke besvart");
                } else {
                    addMarkdownText(risikoscenario.getBeskrivelse());
                }
                newLine();
                addMarkdownText("**Sannsynlighetsnivå**: " + sannsynlighetsNivaaToText(risikoscenario.getSannsynlighetsNivaa()));
                newLine();
                if (risikoscenario.getSannsynlighetsNivaaBegrunnelse().isEmpty()) {
                    addText("Ingen begrunnelse");
                } else {
                    addMarkdownText(risikoscenario.getSannsynlighetsNivaaBegrunnelse());
                }
                newLine();
                addMarkdownText("**Konsekvensnivå**: " + konsekvensNivaaToText(risikoscenario.getKonsekvensNivaa()));
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
                addMarkdownText("**Sannsynlighetsnivå etter tiltak**: " + sannsynlighetsNivaaToText(risikoscenario.getSannsynlighetsNivaaEtterTiltak()));
                newLine();
                addMarkdownText("**Konsekvensnivå etter tiltak**: " + konsekvensNivaaToText(risikoscenario.getKonsekvensNivaaEtterTiltak()));
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

        private void generateTiltak(RisikoscenarioResponse risikoscenario, List<TiltakResponse> tiltakList, List<RisikoscenarioResponse> risikoscenarioResponseList) {
            List<TiltakResponse> gjeldendeTiltak = tiltakList.stream()
                    .filter(tiltak -> risikoscenario.getTiltakIds().contains(tiltak.getId())).toList();


            gjeldendeTiltak.forEach(tiltak -> {
                List<UUID> gjenbruktScenarioIds = tiltak.getRisikoscenarioIds().stream().filter(id -> !risikoscenario.getId().equals(id)).toList();
                List<String> gjenbruktScenarioNames = risikoscenarioResponseList.stream().filter(risikoscenarioResponse -> gjenbruktScenarioIds.contains(risikoscenarioResponse.getId()))
                        .map(RisikoscenarioResponse::getNavn).toList();

                addHeading5(tiltak.getNavn());
                newLine();
                addHeading6("Beskrivelse");
                addMarkdownText(tiltak.getBeskrivelse());
                newLine();
                addMarkdownText("**Tiltaksansvarlig**: " + getAnsvarlig(tiltak.getAnsvarlig()));
                newLine();
                addMarkdownText("**Tiltaksfrist**: " + dateToString(tiltak.getFrist()));
                newLine();
                if (!gjenbruktScenarioIds.isEmpty()) {
                    addHeading6("Tiltaket er gjenbrukt ved følgende scenarioer:");
                    gjenbruktScenarioNames.forEach(name -> addMarkdownText("- " + name));
                    newLine();
                }
            });
        }

        private void generatePvoTilbakemelding(Tilbakemeldingsinnhold tilbakemelding) {
            addHeading3("Tilbakemelding fra personvernombudet");
            newLine();
            addHeading4("Vurdéring av etterleverens svar.");
            addText(vurderingsBidragToText(tilbakemelding.getBidragsVurdering()));
            newLine();
            addHeading4("Tilbakemelding");
            if (tilbakemelding.getTilbakemeldingTilEtterlevere() != null && !tilbakemelding.getTilbakemeldingTilEtterlevere().isBlank()) {
                addMarkdownText(tilbakemelding.getTilbakemeldingTilEtterlevere());
            } else {
                addText("Ingen tilbakemelding");
            }
        }

        private String getAnsvarlig(Resource ansvarlig) {
            if (ansvarlig.getFullName() == null || ansvarlig.getFullName().isEmpty()) {
                return "Ingen ansvarlig er satt";
            } else {
                return ansvarlig.getFullName();
            }
        }

        private String dateToString(LocalDate date) {
            if (date == null) {
                return "Det er ikke satt en frist for tiltaket";
            } else {
                return DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG).format(date);
            }
        }

        private String vurderingsBidragToText(String vurderingsBidrag) {
            return switch (vurderingsBidrag) {
                case "TILSTREKELIG" -> "Ja, tilstrekkelig";
                case "TILSTREKKELIG_FORBEHOLDT" ->
                        "Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som beskrives i fritekst under";
                case "UTILSTREKELIG" -> "Utilstrekkelig, beskrives nærmere under";
                default -> "Ingen  vurdert";
            };
        }

        private String sannsynlighetsNivaaToText(Integer sannsynlighetsnivaa) {
            return switch (sannsynlighetsnivaa) {
                case 1 -> "Meget lite sannsynlig";
                case 2 -> "Lite sannsynlig";
                case 3 -> "Moderat sannsynlig";
                case 4 -> "Sannsynlig";
                case 5 -> "Nesten sikkert";
                default -> "Ingen sannsynlighetsnivå satt";
            };
        }

        private String konsekvensNivaaToText(Integer konsekvensnivaa) {
            return switch (konsekvensnivaa) {
                case 1 -> "Ubetydelig konsekvens";
                case 2 -> "Lav konsekvens";
                case 3 -> "Moderat konsekvens";
                case 4 -> "Alvorlig konsekvens";
                case 5 -> "Svært alvorlig konsekvens";
                default -> "Ingen konsekvensnivå satt";
            };
        }

        private String getRisikoscenarioStatus(RisikoscenarioResponse risikoscenario) {
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

        private void addBooleanDataText(String label, Boolean value) {
            addHeading4(label);
            addText(BooleanUtils.toString(value, "Ja", "Nei", "Ikke besvart"));
        }


        private void addDataText(String label, String text) {
            addHeading4(label);
            if (text == null) {
                addText("Ikke besvart");
            } else {
                addMarkdownText(text);
            }
        }

        private void generateOvrigeEgenskaperFraBehandlinger(PvkDokument pvkDokument) {
            var allYtterligeEgenskaper = CodelistService.getCodelist(ListName.YTTERLIGERE_EGENSKAPER);

            addHeading4("Øvrige egenskaper for behandlingene:");

            allYtterligeEgenskaper.forEach(egenskap -> {
                if (pvkDokument.getPvkDokumentData().getYtterligereEgenskaper().contains(egenskap.getCode())) {
                    addMarkdownText("- **Det gjelder for** " + egenskap.getShortName().toLowerCase());
                } else {
                    addMarkdownText("- **Det gjelder ikke for** " + egenskap.getShortName().toLowerCase());
                }
            });

        }

        private void generateEgenskaperFraBehandlinger(List<Behandling> behandlingList) {
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

            addHeading4("Følgende egenskaper er hentet fra Behandlingskatalogen:");
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

        private void addDatabehandlerList(List<Behandling> behandlingList) {
            addHeading3("I Behandlingskatalogen står det at følgende databehandlere benyttes:");
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

        private void addPersonkategoriList(List<Behandling> behandlingList) {
            List<ExternalCode> personkategorier = new ArrayList<>();

            behandlingList.forEach(behandling -> {
                behandling.getPolicies().forEach(policy -> {
                    personkategorier.addAll(policy.getPersonKategorier());
                });
            });

            addHeading4("I Behandlingskatalogen står det at dere behandler personopplysninger om:");
            List<String> personkategoriList = new ArrayList<>(personkategorier.stream().map(ExternalCode::getShortName).toList());
            Set<String> set = new HashSet<>(personkategoriList);
            personkategoriList.clear();
            personkategoriList.addAll(set);
            personkategoriList.forEach(personkategori -> {
                addMarkdownText("- " + personkategori);
            });
        }


        private String pvkDokumentStatusText(PvkDokumentStatus status) {
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
