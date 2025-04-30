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
import no.nav.data.etterlevelse.common.domain.ExternalCode;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.behandling.dto.DataBehandler;
import no.nav.data.integration.behandling.dto.PolicyResponse;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.risikoscenario.RisikoscenarioService;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.risikoscenario.dto.RisikoscenarioResponse;
import no.nav.data.pvk.tiltak.TiltakService;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import org.apache.commons.lang3.BooleanUtils;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;
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
    private final TiltakService tiltakService;
    private final BehandlingService behandlingService;

    public byte[] generateDocFor(UUID pvkDokumentId) throws IOException {
        PvkDokument pvkDokument = pvkDokumentService.get(pvkDokumentId);
        Optional<BehandlingensLivslop> behandlingensLivslop = behandlingensLivslopService.getByEtterlevelseDokumentasjon(pvkDokument.getEtterlevelseDokumentId());
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId());

        List<RisikoscenarioResponse> risikoscenarioList = risikoscenarioService.getByPvkDokument(pvkDokument.getId().toString(), RisikoscenarioType.ALL)
                .stream().map(RisikoscenarioResponse::buildFrom).toList();

        risikoscenarioList.forEach(risikoscenario -> {
            risikoscenario.setTiltakIds(risikoscenarioService.getTiltak(risikoscenario.getId()));
        });

        List<Tiltak> tiltakList = tiltakService.getByPvkDokument(pvkDokument.getId());
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

        doc.generate(pvkDokument, behandlingensLivslop, behandlingList, risikoscenarioList, tiltakList);

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

        public void generate(PvkDokument pvkDokument, Optional<BehandlingensLivslop> behandlingensLivslop, List<Behandling> behandlingList, List<RisikoscenarioResponse> risikoscenarioList, List<Tiltak> tiltakList) {

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

            addHeading3("Vurdering");

            generateEgenskaperFraBehandlinger(behandlingList);

            generateOvrigeEgenskaperFraBehandlinger(pvkDokument);

            addHeading4("Hvilken vurdering har dere kommet fram til?");
            if (pvkDokument.getPvkDokumentData().getSkalUtforePvk() == null) {
                addText("Ingen vurdering");
            } else if (!pvkDokument.getPvkDokumentData().getSkalUtforePvk()) {
                addText("Vi skal ikke gjennomføre PVK");

                addHeading4("Begrunnelse av vurderingen");
                addText(pvkDokument.getPvkDokumentData().getPvkVurderingsBegrunnelse());
            } else {
                addText("Vi skal gjennomføre en PVK");

                addHeading4("Status");
                addText(pvkDokumentStatusText(pvkDokument.getStatus()));

                generateBehandlingensArtOgOmfang(pvkDokument, behandlingList);

                generateInnvolveringAvEksterne(pvkDokument, behandlingList);


                generateRisikoscenarioOgTiltak(risikoscenarioList, tiltakList);


            }
        }

        private void generateBehandlingensArtOgOmfang(PvkDokument pvkDokument, List<Behandling> behandlingList) {
            newLine();
            addHeading3("Behandlingens art og omfang");
            addPersonkategoriList(behandlingList);


            addBooleanDataText("Stemmer denne lista over personkategorier?", pvkDokument.getPvkDokumentData().getStemmerPersonkategorier());

            addDataText("For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om.", pvkDokument.getPvkDokumentData().getPersonkategoriAntallBeskrivelse());

            addDataText("Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang.", pvkDokument.getPvkDokumentData().getTilgangsBeskrivelsePersonopplysningene());

            addDataText("Beskriv hvordan og hvor lenge personopplysningene skal lagres.", pvkDokument.getPvkDokumentData().getLagringsBeskrivelsePersonopplysningene());

        }

        private void generateInnvolveringAvEksterne(PvkDokument pvkDokument, List<Behandling> behandlingList) {
            newLine();
            addHeading3("Involvering av eksterne");
            addHeading4("Representanter for de registrerte");
            addPersonkategoriList(behandlingList);

            addBooleanDataText("Har dere involvert en representant for de registrerte?", pvkDokument.getPvkDokumentData().getHarInvolvertRepresentant());

            addDataText("Utdyp hvordan dere har involvert representant(er) for de registrerte", pvkDokument.getPvkDokumentData().getRepresentantInvolveringsBeskrivelse());

            newLine();
            addHeading3("Representanter for databehandlere");
            addDatabehandlerList(behandlingList);

            addBooleanDataText("Har dere involvert en representant for databehandlere?", pvkDokument.getPvkDokumentData().getHarDatabehandlerRepresentantInvolvering());

            addDataText("Utdyp hvordan dere har involvert representant(er) for databehandler(e)", pvkDokument.getPvkDokumentData().getDataBehandlerRepresentantInvolveringBeskrivelse());
        }

        private void generateRisikoscenarioOgTiltak(List<RisikoscenarioResponse> risikoscenarioList, List<Tiltak> tiltakList) {
            newLine();
            addHeading3("Risikoscenario og tiltak");
            newLine();
            risikoscenarioList.forEach(risikoscenario -> {
                addHeading4(risikoscenario.getNavn());
                addMarkdownText("**Status**: " + getRisikoscenarioStatus(risikoscenario));
                addHeading5("Beskrivelse");
                if (risikoscenario.getBeskrivelse().isEmpty()) {
                    addText("Ikke besvart");
                } else {
                    addMarkdownText(risikoscenario.getBeskrivelse());
                }
                addMarkdownText("**Sannsynlighetsnivå**: " + sannsynlighetsNivaaToText(risikoscenario.getSannsynlighetsNivaa()));

                if (risikoscenario.getSannsynlighetsNivaaBegrunnelse().isEmpty()) {
                    addText("Ingen begrunnelse");
                } else {
                    addMarkdownText(risikoscenario.getSannsynlighetsNivaaBegrunnelse());
                }

                addMarkdownText("**Konsekvensnivå**: " + konsekvensNivaaToText(risikoscenario.getKonsekvensNivaa()));

                if (risikoscenario.getKonsekvensNivaaBegrunnelse().isEmpty()) {
                    addText("Ingen begrunnelse");
                } else {
                    addMarkdownText(risikoscenario.getKonsekvensNivaaBegrunnelse());
                }

            });
        }

        private String sannsynlighetsNivaaToText(Integer sannsynlighetsnivaa) {
            switch (sannsynlighetsnivaa) {
                case 1:
                    return "Meget lite sannsynlig";
                case 2:
                    return "Lite sannsynlig";
                case 3:
                    return "Moderat sannsynlig";
                case 4:
                    return "Sannsynlig";
                case 5:
                    return "Nesten sikkert";
                default:
                    return "Ingen sannsynlighetsnivå satt";
            }
        }

        private String konsekvensNivaaToText(Integer konsekvensnivaa) {
            switch (konsekvensnivaa) {
                case 1:
                    return "Ubetydelig konsekvens";
                case 2:
                    return "Lav konsekvens";
                case 3:
                    return "Moderat konsekvens";
                case 4:
                    return "Alvorlig konsekvens";
                case 5:
                    return "Svært alvorlig konsekvens";
                default:
                    return "Ingen konsekvensnivå satt";
            }
        }

        ;

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
