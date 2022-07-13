package no.nav.data.etterlevelse.export;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
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
import no.nav.data.etterlevelse.export.domain.EtterlevelseMedKravData;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.etterlevelse.kravprioritering.KravPrioriteringService;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.begrep.BegrepService;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtterlevelseToDoc {
    private static final ObjectFactory etterlevelseFactory = Context.getWmlObjectFactory();

    private final KravService kravService;
    private final BehandlingService behandlingService;

    private final TeamcatTeamClient teamService;

    private final BegrepService begrepService;

    private final EtterlevelseService etterlevelseService;

    private final CodeUsageService codeUsageService;

    private final KravPrioriteringService kravPrioriteringService;

    public void getBehandlingData(Behandling behandling, EtterlevelseDocumentBuilder doc) {
        doc.addTitle("Etterlevelse for B" + behandling.getNummer() + " " + behandling.getOverordnetFormaal().getShortName());
        doc.addHeading3(behandling.getNavn());
        doc.addHeading3("Team");
        if (behandling.getTeams() != null && !behandling.getTeams().isEmpty()) {
            behandling.getTeams().forEach(teamId -> {
                var team = teamService.getTeam(teamId);
                if (!team.isEmpty()) {
                    doc.addText("- " + team.get().getName());
                }
            });
        } else {
            doc.addText("Ikke angitt");
        }
    }

    private List<EtterlevelseMedKravData> getEtterlevelseByFilter(String behandlingId, List<String> statusKoder, List<String> lover) {

        List<Etterlevelse> etterlevelser = etterlevelseService.getByBehandling(behandlingId);
        List<EtterlevelseMedKravData> etterlevelseMedKravData = new ArrayList<>();

        if (Objects.nonNull(statusKoder)) {
            log.info("Exporting list of etterlevelse for behandling with id " + behandlingId + " to doc filtered by status");
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

        var behandling = behandlingService.getBehandling(etterlevelse.getBehandlingId());
        var doc = new EtterlevelseDocumentBuilder();
        getBehandlingData(behandling, doc);

        var krav = kravService.getByKravNummer(etterlevelse.getKravNummer(), etterlevelse.getKravVersjon());
        EtterlevelseMedKravData etterlevelseMedKravData = EtterlevelseMedKravData.builder().etterlevelseData(etterlevelse)
                .kravData(krav).build();

        doc.generate(etterlevelseMedKravData);

        return doc.build();
    }

    public byte[] generateDocFor(UUID behandlingId, List<String> statusKoder, List<String> lover, String temaKode) {

        var behandling = behandlingService.getBehandling(behandlingId.toString());
        List<CodeUsage> temaListe = codeUsageService.findCodeUsageOfList(ListName.TEMA);

        List<EtterlevelseMedKravData> etterlevelseMedKravData = getEtterlevelseByFilter(behandlingId.toString(), statusKoder, lover);

        if (etterlevelseMedKravData.isEmpty()) {
            throw new NotFoundException("No etterlevelser found for behandling with id " + behandlingId);
        }

        var doc = new EtterlevelseDocumentBuilder();
        getBehandlingData(behandling, doc);

        doc.addHeading1("Dokumentet inneholder følgende etterlevelse for krav (" + etterlevelseMedKravData.size() + ")");

        doc.addTableOfContent(etterlevelseMedKravData, temaListe);

        for (CodeUsage tema: temaListe) {
            String temaShortName = CodelistService.getCodelist(ListName.TEMA, tema.getCode()).getShortName();
            List<String> regelverk = tema.getCodelist().stream().map(Codelist::getCode).toList();

            List<EtterlevelseMedKravData> filteredDataByTema = doc.getSortedEtterlevelseMedKravData(etterlevelseMedKravData, regelverk);

            if (!filteredDataByTema.isEmpty()) {
                doc.pageBreak();
                doc.addHeading2(temaShortName);
                for (int i = 0; i < filteredDataByTema.size(); i++) {
                    if (i != filteredDataByTema.size() - 1) {
                        doc.pageBreak();
                    }
                    doc.generate(filteredDataByTema.get(i));
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

            String etterlevelseName = "Etterlevelse for K" + etterlevelse.getKravNummer() + "." + etterlevelse.getKravVersjon();

            if (krav.isPresent()) {
                etterlevelseName = etterlevelseName + " " + krav.get().getNavn();
            }

            var header = addHeading2(etterlevelseName);

            addBookmark(header, etterlevelse.getId().toString());

            if (krav.isPresent()) {
                addHeading4("Hensikten med kravet");
                if (krav.get().getHensikt() != null && !krav.get().getHensikt().isEmpty()) {
                    addMarkdownText(krav.get().getHensikt());
                }
            }

            addHeading4("Etterelvelses status: " + etterlevelseStatusText(etterlevelse.getStatus()));

            if (etterlevelse.getChangeStamp() != null && etterlevelse.getChangeStamp().getLastModifiedBy() != null && etterlevelse.getChangeStamp().getLastModifiedDate() != null) {
                addLastEditedBy(etterlevelse.getChangeStamp());
            } else {
                addText("Sist endret: Ikke angitt");
            }

            for (int s = 0; s < etterlevelse.getSuksesskriterieBegrunnelser().size(); s++) {
                SuksesskriterieBegrunnelse suksesskriterieBegrunnelse = etterlevelse.getSuksesskriterieBegrunnelser().get(s);

                int suksesskriterieNumber = s + 1;
                addHeading4("SUKSESSKRITERIE " + suksesskriterieNumber + " AV " + etterlevelse.getSuksesskriterieBegrunnelser().size());

                if (krav.isPresent()) {
                    List<Suksesskriterie> suksesskriterieList = krav.get().getSuksesskriterier()
                            .stream().filter(sk -> sk.getId() == suksesskriterieBegrunnelse.getSuksesskriterieId()).toList();
                    if (!suksesskriterieList.isEmpty()) {
                        Suksesskriterie suksesskriterie = suksesskriterieList.get(0);
                        addHeading4(suksesskriterie.getNavn());
                        addText("Id: " + suksesskriterie.getId());
                        addText("Behov for begrunnelse: " + boolToText(suksesskriterie.isBehovForBegrunnelse()));
                        addText("Suksesskriterie begrunnelse status: ", begrunnelseStatusText(suksesskriterieBegrunnelse.getSuksesskriterieStatus()));
                        if (suksesskriterie.isBehovForBegrunnelse()) {
                            getSuksesskriterieBegrunnelseHeader(suksesskriterieBegrunnelse.getSuksesskriterieStatus());
                            addMarkdownText(suksesskriterieBegrunnelse.getBegrunnelse());
                        }

                        addHeading3("Utfyllende om kriteriet");
                        addMarkdownText(suksesskriterie.getBeskrivelse());
                    }
                } else {
                    addText("Id: " + suksesskriterieBegrunnelse.getSuksesskriterieId());
                    addText("Suksesskriterie begrunnelse status: ", begrunnelseStatusText(suksesskriterieBegrunnelse.getSuksesskriterieStatus()));
                    getSuksesskriterieBegrunnelseHeader(suksesskriterieBegrunnelse.getSuksesskriterieStatus());
                    addMarkdownText(suksesskriterieBegrunnelse.getBegrunnelse());
                }

                addText(" ");
            }


            if (krav.isPresent()) {
                addHeading4("Lenker og annen informtion om kravet");

                addHeading4("Kilder");
                if (!krav.get().getDokumentasjon().isEmpty()) {
                    for (int d = 0; d < krav.get().getDokumentasjon().size(); d++) {
                        addMarkdownText("- " + krav.get().getDokumentasjon().get(d));
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading4("Etiketter");
                if (krav.get().getTagger() != null && !krav.get().getTagger().isEmpty()) {
                    addText(String.join(", ", krav.get().getTagger()));
                } else {
                    addText("Ikke angitt");
                }

                addHeading4("Relevante implementasjoner");
                if (krav.get().getImplementasjoner() != null && !krav.get().getImplementasjoner().isEmpty()) {
                    addMarkdownText(krav.get().getImplementasjoner());
                } else {
                    addText("Ikke angitt");
                }

                addHeading4("Begreper");
                if (krav.get().getBegrepIder() != null && !krav.get().getBegrepIder().isEmpty()) {
                    for (int b = 0; b < krav.get().getBegrepIder().size(); b++) {
                        BegrepResponse begrepResponse = begrepService.getBegrep(krav.get().getBegrepIder().get(b)).orElse(null);
                        addText("- " + begrepResponse.getId() + " " + begrepResponse.getNavn());
                        addText("  " + begrepResponse.getBeskrivelse());
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading4("Relasjoner til andre krav");
                if (krav.get().getKravIdRelasjoner() != null && !krav.get().getKravIdRelasjoner().isEmpty()) {
                    for (int x = 0; x < krav.get().getKravIdRelasjoner().size(); x++) {
                        Krav kravResponse = kravService.get(UUID.fromString(krav.get().getKravIdRelasjoner().get(x)));
                        addText("- K" + kravResponse.getKravNummer() + "." + kravResponse.getVersion() + " " + kravResponse.getNavn());
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading4("Krav er relevant for");
                if (krav.get().getRelevansFor() != null && !krav.get().getRelevansFor().isEmpty()) {
                    for (int r = 0; r < krav.get().getRelevansFor().size(); r++) {
                        Codelist codelist = CodelistService.getCodelist(ListName.RELEVANS, krav.get().getRelevansFor().get(r));
                        addText("- " + codelist.getShortName());
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading4("Dette er nytt fra forrige versjon");
                if (krav.get().getVersjonEndringer() != null && !krav.get().getVersjonEndringer().isEmpty()) {
                    addMarkdownText(krav.get().getVersjonEndringer());
                } else {
                    addText("Ikke angitt");
                }


                addHeading4("Ansvarlig");
                if (krav.get().getUnderavdeling() != null && !krav.get().getUnderavdeling().isEmpty()) {
                    Codelist codelist = CodelistService.getCodelist(ListName.UNDERAVDELING, krav.get().getUnderavdeling());
                    addText("- " + codelist.getShortName());
                } else {
                    addText("Ikke angitt");
                }

                addHeading4("Regelverk");
                if (krav.get().getRegelverk() != null && !krav.get().getRegelverk().isEmpty()) {
                    for (int l = 0; l < krav.get().getRegelverk().size(); l++) {
                        Regelverk regelverk = krav.get().getRegelverk().get(l);

                        Codelist codelist = CodelistService.getCodelist(ListName.LOV, regelverk.getLov());
                        addText("- " + codelist.getShortName() + " " + regelverk.getSpesifisering());
                    }
                } else {
                    addText("Ikke angitt");
                }

                addHeading4("Varslingsadresser");
                if (krav.get().getVarslingsadresser() != null && !krav.get().getVarslingsadresser().isEmpty()) {
                    for (int v = 0; v < krav.get().getVarslingsadresser().size(); v++) {
                        Varslingsadresse varslingsadresse = krav.get().getVarslingsadresser().get(v);

                        addText("- " + adresseTypeText(varslingsadresse.getType()) + ": " + varslingsadresse.getAdresse());
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
            };
        }

        public void getSuksesskriterieBegrunnelseHeader(SuksesskriterieStatus status) {
            if (status.equals(SuksesskriterieStatus.IKKE_RELEVANT)) {
                addHeading4("Hvorfor er ikke kriteriet relevant?");
            } else {
                addHeading4("Hvordan oppfylles kriteriet?");
            }
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
                String temaShortName = CodelistService.getCodelist(ListName.TEMA, tema.getCode()).getShortName();
                List<String> lover = tema.getCodelist().stream().map(Codelist::getCode).toList();

                List<EtterlevelseMedKravData> filteredDataByTema = getSortedEtterlevelseMedKravData(etterlevelseList, lover);

                if (!filteredDataByTema.isEmpty()) {
                    addHeading3(temaShortName);
                    for (EtterlevelseMedKravData etterlevelseMedKravData : filteredDataByTema) {
                        Etterlevelse etterlevelse = etterlevelseMedKravData.getEtterlevelseData();
                        var name = "K" + etterlevelse.getKravNummer() + "." + etterlevelse.getKravVersjon();
                        var bookmark = etterlevelse.getId().toString();
                        addListItem(name, currListId, bookmark);
                    }
                }
            }
        }
    }
}
