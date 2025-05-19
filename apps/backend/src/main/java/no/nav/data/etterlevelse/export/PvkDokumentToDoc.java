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
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.common.domain.ExternalCode;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.dto.RegelverkResponse;
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
    private final KravService kravService;

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

        List<RisikoscenarioResponse> risikoscenarioList = new ArrayList<>(
                risikoscenarioService.getByPvkDokument(pvkDokument.getId().toString(), RisikoscenarioType.ALL)
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


        List<TiltakResponse> tiltakList = tiltakService.getByPvkDokument(pvkDokument.getId()).stream().map(TiltakResponse::buildFrom).toList();

        tiltakList.forEach(tiltak -> {
            tiltak.setRisikoscenarioIds(tiltakService.getRisikoscenarioer(tiltak.getId()));
        });

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
                if (pvkDokument.getPvkDokumentData().getMerknadTilPvoEllerRisikoeier().isEmpty()) {
                    addText("Ingen merknad.");
                } else {
                    addMarkdownText(pvkDokument.getPvkDokumentData().getMerknadTilPvoEllerRisikoeier());
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

        private void generateBehandlingensArtOgOmfang(PvkDokument pvkDokument, List<Behandling> behandlingList, PvoTilbakemelding pvoTilbakemelding) {
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

        private void generateInnvolveringAvEksterne(PvkDokument pvkDokument, List<Behandling> behandlingList, PvoTilbakemelding pvoTilbakemelding) {
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

        private void generateRisikoscenarioOgTiltak(List<RisikoscenarioResponse> risikoscenarioList, List<TiltakResponse> tiltakList, PvoTilbakemelding pvoTilbakemelding) {
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

        private void generateTiltak(RisikoscenarioResponse risikoscenario, List<TiltakResponse> tiltakList, List<RisikoscenarioResponse> risikoscenarioResponseList) {
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

        private void generatePvoTilbakemelding(Tilbakemeldingsinnhold tilbakemelding) {
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
            addLabel(label);
            addText(BooleanUtils.toString(value, "Ja", "Nei", "Ikke besvart"));
        }


        private void addDataText(String label, String text) {
            addLabel(label);
            if (text == null) {
                addText("Ikke besvart");
            } else {
                addMarkdownText(text);
            }
        }

        private void generateOvrigeEgenskaperFraBehandlinger(PvkDokument pvkDokument) {
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

        private void addDatabehandlerList(List<Behandling> behandlingList) {
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

        private void addPersonkategoriList(List<Behandling> behandlingList) {
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


        private String pvkDokumentStatusText(PvkDokumentStatus status) {
            return switch (status) {
                case AKTIV, UNDERARBEID -> "Under arbeid";
                case SENDT_TIL_PVO -> "Sendt til personvernombudet";
                case PVO_UNDERARBEID -> "Personvernombudet jobber med vurderingen";
                case VURDERT_AV_PVO -> "Vurdert av personvernombudet";
                case TRENGER_GODKJENNING -> "Trenger godkjenning fra risikoeier";
                case GODKJENT_AV_RISIKOEIER -> "Godkjent av risikoeier";
            };
        }
    }
}
