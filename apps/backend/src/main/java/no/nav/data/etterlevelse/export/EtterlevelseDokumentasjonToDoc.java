package no.nav.data.etterlevelse.export;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.CodeUsageService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.CodeUsage;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieBegrunnelse;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.export.domain.EtterlevelseMedKravData;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.integration.begrep.BegrepService;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonToDoc {
    private static final ObjectFactory etterlevelseFactory = Context.getWmlObjectFactory();

    private final KravService kravService;
    private final BehandlingService behandlingService;

    private final TeamcatTeamClient teamService;

    private final BegrepService begrepService;

    private final EtterlevelseService etterlevelseService;

    private final CodeUsageService codeUsageService;

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    public void getEtterlevelseDokumentasjonData(EtterlevelseDokumentasjon etterlevelseDokumentasjon, EtterlevelseDocumentBuilder doc) {
        SimpleDateFormat formatter = new SimpleDateFormat("dd'.' MMMM yyyy 'kl 'HH:mm");
        Date date = new Date();
        doc.addTitle("Etterlevelsesdokumentasjon");
        doc.addSubtitle("E" + etterlevelseDokumentasjon.getEtterlevelseNummer() + ": " + etterlevelseDokumentasjon.getTitle());
        doc.addText("Exportert " + formatter.format(date));

        if (etterlevelseDokumentasjon.getBehandlingIds() != null && !etterlevelseDokumentasjon.getBehandlingIds().isEmpty()) {
            doc.addHeading3("Knyttet behandling");
            etterlevelseDokumentasjon.getBehandlingIds().forEach(behandlingId -> {
                try {
                    var behandling = behandlingService.getBehandling(behandlingId);
                    doc.addText("B" + behandling.getNummer() + " " + behandling.getOverordnetFormaal().getShortName() + ": " + behandling.getNavn());
                }
               catch (WebClientResponseException.NotFound e) {
                   doc.addText("Fant ikke behandling med ID: " + behandlingId);
                }

            });
        }

        doc.addHeading3("Team");
        if (etterlevelseDokumentasjon.getTeams() != null && !etterlevelseDokumentasjon.getTeams().isEmpty()) {
            etterlevelseDokumentasjon.getTeams().forEach(teamId -> {
                var team = teamService.getTeam(teamId);
                if (team.isPresent()) {
                    doc.addMarkdownText("- [" + team.get().getName() + "](" + System.getenv("CLIENT_TEAMCAT_FRONTEND_URL") + "/team/" + team.get().getId() + ")");
                }
                else {
                    doc.addMarkdownText("- [Fant ikke team med ID: " + teamId + "](" + System.getenv("CLIENT_TEAMCAT_FRONTEND_URL") + "/team/" + teamId + ")");
                }

            });
        } else {
            doc.addText("Ikke angitt");
        }
    }

    private List<EtterlevelseMedKravData> getEtterlevelseByFilter(String etterlevelseDokumentasjonId, List<String> statusKoder, List<String> lover) {

        List<Etterlevelse> etterlevelser = etterlevelseService.getByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId);
        List<EtterlevelseMedKravData> etterlevelseMedKravData = new ArrayList<>();

        if (Objects.nonNull(statusKoder)) {
            log.info("Exporting list of etterlevelseDokumentasjon with id " + etterlevelseDokumentasjonId + " to doc filtered by status");
            etterlevelser = etterlevelser.stream().filter(e -> statusKoder.contains(e.getStatus().toString())).toList();
        }

        etterlevelser.forEach(etterlevelse -> {
            Optional<Krav> krav = kravService.getByKravNummer(etterlevelse.getKravNummer(), etterlevelse.getKravVersjon());
            etterlevelseMedKravData.add(EtterlevelseMedKravData.builder().etterlevelseData(etterlevelse).kravData(krav).build());
        });


        if (!lover.isEmpty()) {
            List<EtterlevelseMedKravData> temaFilteredEtterlevelse = new ArrayList<>();
            etterlevelseMedKravData.forEach(etterlevelse -> {
                if (etterlevelse.getKravData().isPresent()) {
                    if (etterlevelse.getKravData().get().getRegelverk().stream().anyMatch(m -> lover.contains(m.getLov())
                    )) {
                        temaFilteredEtterlevelse.add(etterlevelse);
                    }
                }
            });

            return temaFilteredEtterlevelse;
        }

        return etterlevelseMedKravData;
    }

    public byte[] generateDocForEtterlevelse(UUID etterlevelseId) {

        Etterlevelse etterlevelse = etterlevelseService.get(etterlevelseId);

        EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(etterlevelse.getEtterlevelseDokumentasjonId()));

        var doc = new EtterlevelseDocumentBuilder();

        getEtterlevelseDokumentasjonData(etterlevelseDokumentasjon, doc);


        var krav = kravService.getByKravNummer(etterlevelse.getKravNummer(), etterlevelse.getKravVersjon());
        EtterlevelseMedKravData etterlevelseMedKravData = EtterlevelseMedKravData.builder().etterlevelseData(etterlevelse)
                .kravData(krav).build();

        doc.generate(etterlevelseMedKravData);

        return doc.build();
    }

    public byte[] generateDocFor(UUID etterlevelseDokumentasjonId, List<String> statusKoder, List<String> lover, boolean onlyActiveKrav) {

        var etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(etterlevelseDokumentasjonId);

        List<CodeUsage> temaListe = codeUsageService.findCodeUsageOfList(ListName.TEMA).stream()
                .sorted(Comparator.comparing(CodeUsage::getShortName)).toList();

        List<EtterlevelseMedKravData> etterlevelseMedKravData = getEtterlevelseByFilter(etterlevelseDokumentasjonId.toString(), statusKoder, lover);

        List<EtterlevelseMedKravData> filteredEtterlevelseMedKravData;

        if(onlyActiveKrav) {
            filteredEtterlevelseMedKravData = etterlevelseMedKravData.stream().filter((etterlevelse) ->
                etterlevelse.getKravData().isPresent() && etterlevelse.getKravData().get().getStatus() == KravStatus.AKTIV
            ).toList();
        } else {
            filteredEtterlevelseMedKravData = new ArrayList<>();

            List<Krav> alleAktivKrav = kravService.findForEtterlevelseDokumentasjon(etterlevelseDokumentasjonId.toString())
                    .stream().filter(k -> k.getStatus().equals(KravStatus.AKTIV) ).toList();

            alleAktivKrav.forEach((krav) -> {
                List<EtterlevelseMedKravData> etterlevelseMedKravNummer = etterlevelseMedKravData.stream()
                        .filter((etterlevelse) -> etterlevelse.getEtterlevelseData().getKravNummer().equals(krav.getKravNummer()))
                        .toList();

                //Check if active krav has etterlevelse
                List<EtterlevelseMedKravData> etterlevelseMedKravDataList = etterlevelseMedKravNummer.stream()
                        .filter((etterlevelse) -> etterlevelse.getEtterlevelseData().getKravVersjon().equals(krav.getKravVersjon()))
                        .toList();

                //If no etterlevelse is found, create an empty etterlevelse for krav
                if(etterlevelseMedKravDataList.isEmpty()) {
                    filteredEtterlevelseMedKravData.add(
                            EtterlevelseMedKravData.builder()
                                    .etterlevelseData(
                                            Etterlevelse.builder()
                                                    .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId.toString())
                                                    .kravNummer(krav.getKravNummer())
                                                    .kravVersjon(krav.getKravVersjon())
                                            .build())
                                    .kravData(Optional.of(krav))
                                    .build()
                    );
                }

                //check if krav has earlier version
                if(krav.getKravVersjon() > 1) {
                  for(int tidligereVersjon = krav.getKravVersjon() - 1; tidligereVersjon > 0; tidligereVersjon-- ) {

                      //check if krav with tidligereVersjon has etterlevelse
                      int currentTidligereVersjon = tidligereVersjon;
                      List<EtterlevelseMedKravData> etterleveseMedTidligereVersjon = etterlevelseMedKravNummer.stream()
                              .filter((etterlevelse) -> etterlevelse.getEtterlevelseData().getKravVersjon().equals(currentTidligereVersjon))
                              .toList();

                      //If no etterlevelse is found for earlier version, create an empty etterlevelse for krav
                      if(etterleveseMedTidligereVersjon.isEmpty()) {
                          filteredEtterlevelseMedKravData.add(
                                  EtterlevelseMedKravData.builder()
                                          .etterlevelseData(
                                                  Etterlevelse.builder()
                                                          .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId.toString())
                                                          .kravNummer(krav.getKravNummer())
                                                          .kravVersjon(currentTidligereVersjon)
                                                          .build())
                                          .kravData(kravService.getByKravNummer(krav.getKravNummer(), currentTidligereVersjon))
                                          .build()
                          );
                      }
                  }
                }

            });

            filteredEtterlevelseMedKravData.addAll(etterlevelseMedKravData);
        }

        if (filteredEtterlevelseMedKravData.isEmpty()) {
            throw new NotFoundException("No etterlevelser found for etterlevelse dokumentasjon with id " + etterlevelseDokumentasjonId);
        }

        var doc = new EtterlevelseDocumentBuilder();
        getEtterlevelseDokumentasjonData(etterlevelseDokumentasjon, doc);

        doc.addHeading1("Dokumentet inneholder etterlevelse for " + filteredEtterlevelseMedKravData.size() + " krav");

        doc.addTableOfContent(filteredEtterlevelseMedKravData, temaListe);

        for (CodeUsage tema : temaListe) {
            List<String> regelverk = tema.getCodelist().stream().map(Codelist::getCode).toList();

            List<EtterlevelseMedKravData> filteredDataByTema = doc.getSortedEtterlevelseMedKravData(filteredEtterlevelseMedKravData, regelverk);

            if (!filteredDataByTema.isEmpty()) {
                doc.pageBreak();
                doc.addHeading1(tema.getShortName());
                for (int i = 0; i < filteredDataByTema.size(); i++) {
                    doc.generate(filteredDataByTema.get(i));
                    if (i != filteredDataByTema.size() - 1) {
                        doc.pageBreak();
                    }
                }
            }
        }

        return doc.build();
    }

    class EtterlevelseDocumentBuilder extends WordDocUtils {

        public EtterlevelseDocumentBuilder() {
            super(etterlevelseFactory);
        }

        long listId = 1;

        public void generate(EtterlevelseMedKravData etterlevelseMedKravData) {

            Etterlevelse etterlevelse = etterlevelseMedKravData.getEtterlevelseData();
            Optional<Krav> krav = etterlevelseMedKravData.getKravData();

            String etterlevelseName = "K" + etterlevelse.getKravNummer() + "." + etterlevelse.getKravVersjon();

            if (krav.isPresent()) {
                etterlevelseName = etterlevelseName + " " + krav.get().getNavn();
            }

            var header = addHeading2(etterlevelseName);

            addBookmark(header, etterlevelse.getId().toString());

            if (krav.isPresent()) {
                addHeading3("Hensikten med kravet");
                if (krav.get().getHensikt() != null && !krav.get().getHensikt().isEmpty()) {
                    addMarkdownText(krav.get().getHensikt());
                }
            }


            if(!etterlevelse.getSuksesskriterieBegrunnelser().isEmpty()) {
                for (int s = 0; s < etterlevelse.getSuksesskriterieBegrunnelser().size(); s++) {
                    SuksesskriterieBegrunnelse suksesskriterieBegrunnelse = etterlevelse.getSuksesskriterieBegrunnelser().get(s);

                    int suksesskriterieNumber = s + 1;
                    var suksesskriteriumNavn = "SUKSESSKRITERIUM " + suksesskriterieNumber + " AV " + etterlevelse.getSuksesskriterieBegrunnelser().size();

                    if (krav.isPresent()) {
                        List<Suksesskriterie> suksesskriterieList = krav.get().getSuksesskriterier()
                                .stream().filter(sk -> sk.getId() == suksesskriterieBegrunnelse.getSuksesskriterieId()).toList();
                        if (!suksesskriterieList.isEmpty()) {
                            Suksesskriterie suksesskriterie = suksesskriterieList.get(0);
                            addHeading3(suksesskriteriumNavn + ": " + suksesskriterie.getNavn());

                            addHeading4("Utfyllende om kriteriet");
                            addMarkdownText(suksesskriterie.getBeskrivelse());


                            addHeading4("Status på suksesskriteriet");
                            addText("Status: ", begrunnelseStatusText(suksesskriterieBegrunnelse.getSuksesskriterieStatus()));
                            if (suksesskriterie.isBehovForBegrunnelse()) {
                                addMarkdownText(suksesskriterieBegrunnelse.getBegrunnelse());
                            } else {
                                addText("Ingen beskrivelse kreves");
                            }

                        }
                    } else {
                        addHeading3(suksesskriteriumNavn);
                        addText("Suksesskriterie begrunnelse status: ", begrunnelseStatusText(suksesskriterieBegrunnelse.getSuksesskriterieStatus()));
                        addMarkdownText(suksesskriterieBegrunnelse.getBegrunnelse());
                    }

                    addText(" ");
                }

            } else {
                if (krav.isPresent()) {
                    List<Suksesskriterie> suksesskriterieList = krav.get().getSuksesskriterier();
                    if (!suksesskriterieList.isEmpty()) {
                        for (int s = 0; s < suksesskriterieList.size(); s++) {
                            int suksesskriterieNumber = s +  1;

                            var suksesskriteriumNavn = "SUKSESSKRITERIUM " + suksesskriterieNumber + " AV " + suksesskriterieList.size();

                            Suksesskriterie suksesskriterie = suksesskriterieList.get(s);

                            addHeading3(suksesskriteriumNavn + ": " + suksesskriterie.getNavn());
                            addHeading4("Utfyllende om kriteriet");
                            addMarkdownText("Ikke dokumentert");

                            addHeading4("Status på suksesskriteriet");
                            addText("Status: Ikke dokumentert");

                        }
                    }
                }
            }

            if (krav.isPresent()) {
                addHeading5("Lenker og annen Informasjon om kravet");

                addHeading6("Kilder");
                if (!krav.get().getDokumentasjon().isEmpty()) {
                    for (int d = 0; d < krav.get().getDokumentasjon().size(); d++) {
                        addMarkdownText("- " + krav.get().getDokumentasjon().get(d));
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading6("Etiketter");
                if (krav.get().getTagger() != null && !krav.get().getTagger().isEmpty()) {
                    addText(String.join(", ", krav.get().getTagger()));
                } else {
                    addText("Ikke angitt");
                }

                addHeading6("Relevante implementasjoner");
                if (krav.get().getImplementasjoner() != null && !krav.get().getImplementasjoner().isEmpty()) {
                    addMarkdownText(krav.get().getImplementasjoner());
                } else {
                    addText("Ikke angitt");
                }

                addHeading6("Begreper");
                if (krav.get().getBegrepIder() != null && !krav.get().getBegrepIder().isEmpty()) {
                    for (int b = 0; b < krav.get().getBegrepIder().size(); b++) {
                        BegrepResponse begrepResponse = begrepService.getBegrep(krav.get().getBegrepIder().get(b)).orElse(null);
                        addMarkdownText("- [" + begrepResponse.getNavn() + "]( " + System.getenv("CLIENT_BEGREPSKATALOG_FRONTEND_URL") + "/" + begrepResponse.getId() + ")<br/>" + begrepResponse.getBeskrivelse());
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading6("Relasjoner til andre krav");
                if (krav.get().getKravIdRelasjoner() != null && !krav.get().getKravIdRelasjoner().isEmpty()) {
                    for (int x = 0; x < krav.get().getKravIdRelasjoner().size(); x++) {
                        Krav kravResponse = kravService.get(UUID.fromString(krav.get().getKravIdRelasjoner().get(x)));
                        addText("- K" + kravResponse.getKravNummer() + "." + kravResponse.getVersion() + " " + kravResponse.getNavn());
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading6("Krav er relevant for");
                if (krav.get().getRelevansFor() != null && !krav.get().getRelevansFor().isEmpty()) {
                    for (int r = 0; r < krav.get().getRelevansFor().size(); r++) {
                        Codelist codelist = CodelistService.getCodelist(ListName.RELEVANS, krav.get().getRelevansFor().get(r));
                        addText("- " + codelist.getShortName());
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading6("Dette er nytt fra forrige versjon");
                if (krav.get().getVersjonEndringer() != null && !krav.get().getVersjonEndringer().isEmpty()) {
                    addMarkdownText(krav.get().getVersjonEndringer());
                } else {
                    addText("Ikke angitt");
                }


                addHeading6("Ansvarlig");
                if (krav.get().getUnderavdeling() != null && !krav.get().getUnderavdeling().isEmpty()) {
                    Codelist codelist = CodelistService.getCodelist(ListName.UNDERAVDELING, krav.get().getUnderavdeling());
                    addText("- " + codelist.getShortName());
                } else {
                    addText("Ikke angitt");
                }

                addHeading6("Regelverk");
                if (krav.get().getRegelverk() != null && !krav.get().getRegelverk().isEmpty()) {
                    for (int l = 0; l < krav.get().getRegelverk().size(); l++) {
                        Regelverk regelverk = krav.get().getRegelverk().get(l);

                        Codelist codelist = CodelistService.getCodelist(ListName.LOV, regelverk.getLov());
                        addText("- " + codelist.getShortName() + " " + regelverk.getSpesifisering());
                    }
                } else {
                    addText("Ikke angitt");
                }
            }
        }

        public String etterlevelseStatusText(EtterlevelseStatus status) {
            return switch (status) {
                case UNDER_REDIGERING -> "Under arbeid";
                case FERDIG -> "Oppfylt";
                case OPPFYLLES_SENERE -> "Oppfyles senere";
                case IKKE_RELEVANT -> "Ikke relevant";
                case FERDIG_DOKUMENTERT -> "Oppfylt og ferdig dokumentert";
                case IKKE_RELEVANT_FERDIG_DOKUMENTERT -> "Ikke relevant og ferdig dokumentert ";
            };
        }

        public String begrunnelseStatusText(SuksesskriterieStatus status) {
            return switch (status) {
                case OPPFYLT -> "Oppfylt";
                case UNDER_ARBEID -> "Under arbeid";
                case IKKE_RELEVANT -> "Ikke relevant";
                case IKKE_OPPFYLT -> "Ikke oppfylt";
            };
        }

        private List<EtterlevelseMedKravData> getSortedEtterlevelseMedKravData(List<EtterlevelseMedKravData> etterlevelseMedKravData, List<String> lover) {
            return etterlevelseMedKravData.stream().filter(e -> {
                if (e.getKravData().isPresent()) {
                    return e.getKravData().get().getRegelverk().stream().anyMatch(l -> lover.contains(l.getLov()));
                }
                return false;
            }).sorted((a, b) -> {
                if (a.getEtterlevelseData().getKravNummer().equals(b.getEtterlevelseData().getKravNummer())) {
                    return b.getEtterlevelseData().getKravVersjon().compareTo(a.getEtterlevelseData().getKravVersjon());
                } else {
                    return a.getEtterlevelseData().getKravNummer().compareTo(b.getEtterlevelseData().getKravNummer());
                }
            }).toList();
        }

        public void addTableOfContent(List<EtterlevelseMedKravData> etterlevelseList, List<CodeUsage> temaListe) {

            long currListId = listId++;

            for (CodeUsage tema : temaListe) {
                List<String> lover = tema.getCodelist().stream().map(Codelist::getCode).toList();

                List<EtterlevelseMedKravData> filteredDataByTema = getSortedEtterlevelseMedKravData(etterlevelseList, lover);

                if (!filteredDataByTema.isEmpty()) {
                    addHeading3(tema.getShortName());
                    for (EtterlevelseMedKravData etterlevelseMedKravData : filteredDataByTema) {
                        Etterlevelse etterlevelse = etterlevelseMedKravData.getEtterlevelseData();
                        Optional<Krav> krav = etterlevelseMedKravData.getKravData();
                        var name = "K" + etterlevelse.getKravNummer() + "." + etterlevelse.getKravVersjon();
                        if (krav.isPresent()) {
                            if (krav.get().getNavn().length() > 50) {
                                name = name.concat(" " + krav.get().getNavn().substring(0, 50) + "...");
                            } else {
                                name = name.concat(" " + krav.get().getNavn());
                            }
                        }
                        var bookmark = etterlevelse.getId().toString();
                        addListItem(name, currListId, bookmark);
                    }
                }
            }
        }
    }
}
