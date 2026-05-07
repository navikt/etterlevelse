package no.nav.data.etterlevelse.dashboard;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.dashboard.dto.BehovForPvkStats;
import no.nav.data.etterlevelse.dashboard.dto.DashboardResponse;
import no.nav.data.etterlevelse.dashboard.dto.DashboardTableResponse;
import no.nav.data.etterlevelse.dashboard.dto.DokumenterStats;
import no.nav.data.etterlevelse.dashboard.dto.PvkStats;
import no.nav.data.etterlevelse.dashboard.dto.SeksjonOption;
import no.nav.data.etterlevelse.dashboard.dto.SuksesskriterierStats;
import no.nav.data.etterlevelse.dashboard.dto.TemaDashboardResponse;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieBegrunnelse;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.integration.nom.NomGraphClient;
import no.nav.data.integration.nom.domain.OrgEnhet;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.domain.PvkVurdering;
import no.nav.data.pvk.risikoscenario.RisikoscenarioService;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.tiltak.TiltakService;
import no.nav.data.pvk.tiltak.domain.Tiltak;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseService etterlevelseService;
    private final KravService kravService;
    private final PvkDokumentService pvkDokumentService;
    private final NomGraphClient nomGraphClient;
    private final RisikoscenarioService risikoscenarioService;
    private final TiltakService tiltakService;

    public List<DashboardResponse> getDashboardStats() {
        var avdelinger = nomGraphClient.getAllAvdelinger().stream().sorted(Comparator.comparing(OrgEnhet::getNavn)).toList();
        var result = new ArrayList<DashboardResponse>();
        for (var avdeling : avdelinger) {
            var stats = getAvdelingStats(avdeling.getId());
            result.add(stats);
        }

        var eDokWithNoAvdeling = getStatsForEtterlevelsesDokumentWithNoAvdeling();
        if(eDokWithNoAvdeling != null){
            result.add(eDokWithNoAvdeling);
        }
        return result;
    }

    public List<DashboardTableResponse> getDashboardTable(String avdelingId) {
        List<EtterlevelseDokumentasjon> allEdoksWithAvdeling = etterlevelseDokumentasjonService.getByAvdeling(avdelingId);
        List<Krav> aktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<Krav> utgaattKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.UTGAATT.name())).build());
        List<Krav> utgaatKravUtenNyVersjon = utgaattKrav.stream().filter(uk -> !aktivKrav.stream().map(Krav::getKravNummer).toList().contains(uk.getKravNummer()) ).toList();

        LocalDate now = LocalDate.now();
        return allEdoksWithAvdeling.stream()
                .map(dok -> {
                    List<Etterlevelse> etterlevelserForDok = etterlevelseService.getByEtterlevelseDokumentasjon(dok.getId());
                    List<Krav> kravForEdok = new ArrayList<>(aktivKrav.stream().filter(k ->
                            !new HashSet<>(dok.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
                    ).toList());

                    kravForEdok.addAll(utgaatKravUtenNyVersjon.stream().filter(k ->
                            !new HashSet<>(dok.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
                    ).toList());

                    var etterlevelseDokumentasjonResponse = EtterlevelseDokumentasjonResponse.buildFrom(dok);
                    etterlevelseDokumentasjonService.addBehandlingAndDpBehandlingAndTeamsDataAndResourceDataAndRisikoeiereData(etterlevelseDokumentasjonResponse);
                    var dashboardTableResponse = DashboardTableResponse.buildFrom(etterlevelseDokumentasjonResponse);

                    Optional<PvkDokument> pvkDokument = pvkDokumentService.getByEtterlevelseDokumentasjon(dok.getId());

                    //setting up pvkstats
                    if(pvkDokument.isPresent()) {
                        LocalDateTime lastModifiedDate = pvkDokument.get().getLastModifiedDate();
                        dashboardTableResponse.setPvkStatus(pvkDokument.get().getStatus());
                        dashboardTableResponse.setPvkVurdering(pvkDokument.get().getPvkDokumentData().getPvkVurdering());

                        List<Risikoscenario> alleRisikoscenarioer = risikoscenarioService.getByPvkDokument(pvkDokument.get().getId().toString(), RisikoscenarioType.ALL);
                        List<Tiltak> alleTiltak = tiltakService.getByPvkDokument(pvkDokument.get().getId());

                         Integer antallRisikoscenario = null;
                         Integer antallHoyRisikoscenario = null;
                         Integer antallHoyRisikoEtterTiltak = null;
                         Integer antallIkkeIverksattTiltak = null;
                         Integer antallTiltakFristPassert = null;

                         for (Risikoscenario scenario : alleRisikoscenarioer)   {
                             var scenarioData = scenario.getRisikoscenarioData();
                             if (scenario.getLastModifiedDate().isAfter(lastModifiedDate)) {
                                 lastModifiedDate = scenario.getLastModifiedDate();
                             }

                             if(scenarioData.getKonsekvensNivaaEtterTiltak() != null && scenarioData.getSannsynlighetsNivaaEtterTiltak() != null && scenarioData.getNivaaBegrunnelseEtterTiltak() != null && !scenarioData.getNivaaBegrunnelseEtterTiltak().isEmpty()) {
                                  antallRisikoscenario = (antallRisikoscenario == null) ? 1 : antallRisikoscenario  + 1;
                                  if (scenarioData.getSannsynlighetsNivaa() >= 4 && scenarioData.getKonsekvensNivaa() >= 4) {
                                      antallHoyRisikoscenario = (antallHoyRisikoscenario == null) ? 1 : antallHoyRisikoscenario  + 1;
                                  } else if (scenarioData.getSannsynlighetsNivaa() == 3 && scenarioData.getKonsekvensNivaa() == 5) {
                                      antallHoyRisikoscenario = (antallHoyRisikoscenario == null) ? 1 : antallHoyRisikoscenario  + 1;
                                  } else if (scenarioData.getSannsynlighetsNivaa() == 5 && scenarioData.getKonsekvensNivaa() == 3) {
                                      antallHoyRisikoscenario = (antallHoyRisikoscenario == null) ? 1 : antallHoyRisikoscenario  + 1;
                                  }

                                 if (scenarioData.getSannsynlighetsNivaaEtterTiltak() >= 4 && scenarioData.getKonsekvensNivaaEtterTiltak() >= 4) {
                                     antallHoyRisikoEtterTiltak = (antallHoyRisikoEtterTiltak == null) ? 1 : antallHoyRisikoEtterTiltak  + 1;
                                 } else if (scenarioData.getSannsynlighetsNivaaEtterTiltak() == 3 && scenarioData.getKonsekvensNivaaEtterTiltak() == 5) {
                                     antallHoyRisikoEtterTiltak = (antallHoyRisikoEtterTiltak == null) ? 1 : antallHoyRisikoEtterTiltak  + 1;
                                 } else if (scenarioData.getSannsynlighetsNivaaEtterTiltak() == 5 && scenarioData.getKonsekvensNivaaEtterTiltak() == 3) {
                                     antallHoyRisikoEtterTiltak = (antallHoyRisikoEtterTiltak == null) ? 1 : antallHoyRisikoEtterTiltak  + 1;
                                 }
                             } else if (scenarioData.getIngenTiltak() != null && scenarioData.getIngenTiltak() && scenarioData.getSannsynlighetsNivaa() != null && scenarioData.getKonsekvensNivaa() != null) {
                                 antallRisikoscenario = (antallRisikoscenario == null) ? 1 : antallRisikoscenario  + 1;
                                 if (scenarioData.getSannsynlighetsNivaa() >= 4 && scenarioData.getKonsekvensNivaa() >= 4) {
                                     antallHoyRisikoscenario = (antallHoyRisikoscenario == null) ? 1 : antallHoyRisikoscenario  + 1;
                                 } else if (scenarioData.getSannsynlighetsNivaa() == 3 && scenarioData.getKonsekvensNivaa() == 5) {
                                     antallHoyRisikoscenario = (antallHoyRisikoscenario == null) ? 1 : antallHoyRisikoscenario  + 1;
                                 } else if (scenarioData.getSannsynlighetsNivaa() == 5 && scenarioData.getKonsekvensNivaa() == 3) {
                                     antallHoyRisikoscenario = (antallHoyRisikoscenario == null) ? 1 : antallHoyRisikoscenario  + 1;

                             }
                           }
                         }

                         for (Tiltak tiltak : alleTiltak) {
                             if (tiltak.getLastModifiedDate().isAfter(lastModifiedDate)) {
                                 lastModifiedDate = tiltak.getLastModifiedDate();
                             }
                             if(!tiltak.getTiltakData().isIverksatt()) {
                                 antallIkkeIverksattTiltak = (antallIkkeIverksattTiltak == null) ? 1 : antallIkkeIverksattTiltak  + 1;
                                 if (tiltak.getTiltakData().getFrist() != null && tiltak.getTiltakData().getFrist().isBefore(now)) {
                                     antallTiltakFristPassert = (antallTiltakFristPassert == null) ? 1 : antallTiltakFristPassert  + 1;
                                 }
                             }
                         }



                        var relevantMeldingTilPvo = pvkDokument.get().getPvkDokumentData().getMeldingerTilPvo().stream()
                                .filter(melding -> melding.getInnsendingId() == pvkDokument.get().getPvkDokumentData().getAntallInnsendingTilPvo())
                                .toList();

                        if (!alleRisikoscenarioer.isEmpty()) {
                            dashboardTableResponse.setHasPvkDocumentationStarted(true);
                        }
                        if (!relevantMeldingTilPvo.isEmpty() && relevantMeldingTilPvo.getFirst().getMerknadTilPvo() != null && !Objects.equals(relevantMeldingTilPvo.getFirst().getMerknadTilPvo(), "")) {
                            dashboardTableResponse.setHasPvkDocumentationStarted(true);
                        }
                        if (pvkDokument.get().getPvkDokumentData().getHarInvolvertRepresentant() != null || pvkDokument.get().getPvkDokumentData().getHarDatabehandlerRepresentantInvolvering() != null ||
                                (pvkDokument.get().getPvkDokumentData().getRepresentantInvolveringsBeskrivelse() != null &&
                                        !Objects.equals(pvkDokument.get().getPvkDokumentData().getRepresentantInvolveringsBeskrivelse(), "")) ||
                                (pvkDokument.get().getPvkDokumentData().getDataBehandlerRepresentantInvolveringBeskrivelse() != null &&
                                        !Objects.equals(pvkDokument.get().getPvkDokumentData().getDataBehandlerRepresentantInvolveringBeskrivelse(), ""))
                        ) {
                            dashboardTableResponse.setHasPvkDocumentationStarted(true);
                        } else {
                            dashboardTableResponse.setHasPvkDocumentationStarted(false);
                        }

                         dashboardTableResponse.setAntallRisikoscenario(antallRisikoscenario);
                         dashboardTableResponse.setAntallHoyRisikoscenario(antallHoyRisikoscenario);
                         dashboardTableResponse.setAntallHoyRisikoEtterTiltak(antallHoyRisikoEtterTiltak);
                         dashboardTableResponse.setAntallIkkeIverksattTiltak(antallIkkeIverksattTiltak);
                         dashboardTableResponse.setAntallTiltakFristPassert(antallTiltakFristPassert);
                         dashboardTableResponse.setSistOppdatertPvk(lastModifiedDate);
                    }


                    //etterlevelseStats

                    LocalDateTime sistOppdatertEtterlevelse = LocalDateTime.of(2000, 1, 1, 0, 0);

                    var oppfyltEtterlevelseList = etterlevelserForDok.stream()
                            .filter(e -> kravForEdok.stream().anyMatch(k ->
                                                        k.getKravNummer().equals(e.getKravNummer()) && k.getKravVersjon().equals(e.getKravVersjon()))
                            && e.getStatus() == EtterlevelseStatus.FERDIG_DOKUMENTERT)
                            .toList();

                    long ikkeRelevantCount = etterlevelserForDok.stream()
                            .filter(e -> kravForEdok.stream().anyMatch(k ->
                                    k.getKravNummer().equals(e.getKravNummer()) && k.getKravVersjon().equals(e.getKravVersjon()))
                            && (e.getStatus() == EtterlevelseStatus.IKKE_RELEVANT || e.getStatus() == EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT))
                            .count();

                    long besvartCount = etterlevelserForDok.stream()
                            .filter(e -> kravForEdok.stream().anyMatch(k ->
                                    k.getKravNummer().equals(e.getKravNummer()) && k.getKravVersjon().equals(e.getKravVersjon())))
                            .count();

                    long ikkeBesvartCount = kravForEdok.size() - besvartCount;

                    for (Etterlevelse etterlevelse : etterlevelserForDok) {
                        if(etterlevelse.getLastModifiedDate().isAfter(sistOppdatertEtterlevelse)) {
                            sistOppdatertEtterlevelse = etterlevelse.getLastModifiedDate();
                        }
                    }

                    dashboardTableResponse.setAntallKrav(kravForEdok.size());
                    dashboardTableResponse.setAntallOppfyltKrav(oppfyltEtterlevelseList.size());
                    long oppfyltDenominator = kravForEdok.size() - ikkeRelevantCount;
                    double prosent = oppfyltDenominator > 0 ? ((double) oppfyltEtterlevelseList.size() / oppfyltDenominator) * 100 : 0;
                    dashboardTableResponse.setOppfyltKravProsent( (int) Math.floor(prosent));
                    dashboardTableResponse.setSistOppdatertEtterlevelse(sistOppdatertEtterlevelse);

                    return dashboardTableResponse;
                })
                .sorted(Comparator.comparing(DashboardTableResponse::getEtterlevelseNummer))
                .collect(Collectors.toList());
    }

    public DashboardResponse getAvdelingStats(String avdelingId) {
        var avdeling = nomGraphClient.getAvdelingById(avdelingId).orElse(null);
        var avdelingNavn = avdeling != null ? avdeling.getNavn() : avdelingId;

        List<EtterlevelseDokumentasjon> allDoks = etterlevelseDokumentasjonService.getByAvdeling(avdelingId);

        List<PvkDokument> pvkByDokId = new ArrayList<>();

        allDoks.forEach((eDok) -> {
            pvkDokumentService.getByEtterlevelseDokumentasjon(eDok.getId()).ifPresent(pvkByDokId::add);
        });

        var aktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<Krav> utgaattKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.UTGAATT.name())).build());
        List<Krav> utgaatKravUtenNyVersjon = utgaattKrav.stream().filter(uk -> !aktivKrav.stream().map(Krav::getKravNummer).toList().contains(uk.getKravNummer()) ).toList();

        var dokIds = allDoks.stream().map(EtterlevelseDokumentasjon::getId).toList();
        var etterlevelseByDokId = etterlevelseService.getByEtterlevelseDokumentasjoner(dokIds);

        var result = createAvdelingDashBoardResponse(avdelingId, avdelingNavn, allDoks, pvkByDokId, aktivKrav, utgaatKravUtenNyVersjon, etterlevelseByDokId);

        var seksjonerFromNom = nomGraphClient.getAllSeksjonForAvdeling(avdelingId).stream().sorted(Comparator.comparing(OrgEnhet::getNavn)).toList();

        List<SeksjonOption> seksjonOptions = new ArrayList<>();

        seksjonerFromNom.stream()
                .map(s -> SeksjonOption.builder().id(s.getId()).navn(s.getNavn()).build())
                .sorted(Comparator.comparing(SeksjonOption::getNavn))
                .forEach(seksjonOptions::add);

        Map<String, DashboardResponse> statsBySeksjon = new LinkedHashMap<>();
        for (var seksjon : seksjonerFromNom) {
            var seksjonDoks = allDoks.stream()
                    .filter(d -> d.getEtterlevelseDokumentasjonData().getSeksjoner() != null
                            && d.getEtterlevelseDokumentasjonData().getSeksjoner().stream()
                            .anyMatch(ns -> seksjon.getId().equals(ns.getNomSeksjonId())))
                    .toList();
            var seksjonStats = createAvdelingDashBoardResponse(seksjon.getId(), seksjon.getNavn(), seksjonDoks, pvkByDokId, aktivKrav,utgaatKravUtenNyVersjon, etterlevelseByDokId);
            statsBySeksjon.put(seksjon.getId(), seksjonStats);
        }

        List<EtterlevelseDokumentasjon> eDoksWithNoSeksjon = allDoks.stream().filter(eDok ->
                eDok.getEtterlevelseDokumentasjonData().getSeksjoner() == null ||
                eDok.getEtterlevelseDokumentasjonData().getSeksjoner().isEmpty()
        ).toList();

        if(!eDoksWithNoSeksjon.isEmpty()) {
            seksjonOptions.add(SeksjonOption.builder().id("ingen-seksjon").navn("Ikke valgt seksjon").build());
            var seksjonStats = createAvdelingDashBoardResponse("ingen-seksjon", "Seksjon ikke valgt", eDoksWithNoSeksjon, pvkByDokId, aktivKrav, utgaatKravUtenNyVersjon, etterlevelseByDokId);
            statsBySeksjon.put("ingen-seksjon", seksjonStats);
        }

        result.setSeksjoner(seksjonOptions);
        result.setStatsBySeksjon(statsBySeksjon);

        return result;
    }


    public DashboardResponse getStatsForEtterlevelsesDokumentWithNoAvdeling () {
        List<EtterlevelseDokumentasjon> allDoks = etterlevelseDokumentasjonService.getByAvdeling("");
        if(!allDoks.isEmpty()) {
            List<PvkDokument> pvkByDokId = new ArrayList<>();
            allDoks.forEach((eDok) -> {
                pvkDokumentService.getByEtterlevelseDokumentasjon(eDok.getId()).ifPresent(pvkByDokId::add);
            });

            var aktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
            List<Krav> utgaattKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.UTGAATT.name())).build());
            List<Krav> utgaatKravUtenNyVersjon = utgaattKrav.stream().filter(uk -> !aktivKrav.stream().map(Krav::getKravNummer).toList().contains(uk.getKravNummer()) ).toList();

            var dokIds = allDoks.stream().map(EtterlevelseDokumentasjon::getId).toList();
            var etterlevelseByDokId = etterlevelseService.getByEtterlevelseDokumentasjoner(dokIds);

            return createAvdelingDashBoardResponse("ingen-avdeling", "Ikke valgt avdeling", allDoks, pvkByDokId, aktivKrav, utgaatKravUtenNyVersjon, etterlevelseByDokId);
        } else {
            return null;
        }
    }

    private DashboardResponse createAvdelingDashBoardResponse(
            String avdelingId,
            String avdelingNavn,
            List<EtterlevelseDokumentasjon> doks,
            List<PvkDokument> pvkDokumenter,
            List<Krav> aktivKrav,
            List<Krav> utgaatKravUtenNyVersjon,
            Map<UUID, List<Etterlevelse>> etterlevelseByDokId
    ) {
        int totalDokumenter = doks.size();
        int dokUnderArbeid = 0;
        int dokSendtTilGodkjenning = 0;
        int dokGodkjent = 0;

        List<Etterlevelse> alleAktivEtterlevelse = new ArrayList<>();

        for (var dok : doks) {
            var status = dok.getEtterlevelseDokumentasjonData().getStatus();
            if (status == EtterlevelseDokumentasjonStatus.UNDER_ARBEID) dokUnderArbeid++;
            else if (status == EtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER) dokSendtTilGodkjenning++;
            else if (status == EtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER) dokGodkjent++;

            var etterlevelseList = etterlevelseByDokId.getOrDefault(dok.getId(), List.of());
            List<Krav> kravForEdok = new ArrayList<>(aktivKrav.stream().filter(k ->
                    !new HashSet<>(dok.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
            ).toList());

            kravForEdok.addAll(utgaatKravUtenNyVersjon.stream().filter(k ->
                    !new HashSet<>(dok.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
            ).toList());

            var aktivEtterlevelseList = etterlevelseList.stream()
                    .filter(e -> kravForEdok.stream().anyMatch(k ->
                            k.getKravNummer().equals(e.getKravNummer()) && k.getKravVersjon().equals(e.getKravVersjon())))
                    .toList();

            alleAktivEtterlevelse.addAll(aktivEtterlevelseList);
        }

        SuksesskriterierStats suksesskriterierStats = getSuksesskriterierStats(alleAktivEtterlevelse);

        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonsWithPersonOpplysning = doks.stream()
                .filter(d -> !d.getEtterlevelseDokumentasjonData().getIrrelevansFor().contains("PERSONOPPLYSNINGER"))
                .toList();


        DashboardResponse dashboardResponse = DashboardResponse.builder()
                .avdelingId(avdelingId)
                .avdelingNavn(avdelingNavn)
                .dokumenter(DokumenterStats.builder()
                        .total(totalDokumenter)
                        .underArbeid(dokUnderArbeid)
                        .sendtTilGodkjenning(dokSendtTilGodkjenning)
                        .godkjentAvRisikoeier(dokGodkjent)
                        .build())
                .suksesskriterier(suksesskriterierStats)
                .build();

        getPvkStats(dashboardResponse, etterlevelseDokumentasjonsWithPersonOpplysning, pvkDokumenter);

        return dashboardResponse;
    }

    private void getPvkStats(DashboardResponse avdelingResponse,List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonsWithPersonOpplysning,List<PvkDokument> pvkDokumenter) {
        int totalMedPO = etterlevelseDokumentasjonsWithPersonOpplysning.size();
        int ikkeVurdertBehov = 0;
        int vurdertIkkeBehov = 0;
        int behovIkkePaabegynt = 0;

        int pvkTotal = 0;
        int pvkIkkePaabegynt = 0;
        int pvkUnderArbeid = 0;
        int pvkTilBehandlingPvo = 0;
        int pvkTilbakemeldingPvo = 0;
        int pvkGodkjent = 0;
        int pvkIWord = 0;

        for (var dok : etterlevelseDokumentasjonsWithPersonOpplysning) {
            List<PvkDokument> pvk = pvkDokumenter.stream().filter(p -> p.getEtterlevelseDokumentId().equals(dok.getId())).toList();
            if (pvk.isEmpty()) {
                ikkeVurdertBehov++;
            } else {
                var vurdering = pvk.getFirst().getPvkDokumentData().getPvkVurdering();
                if (vurdering == PvkVurdering.SKAL_IKKE_UTFORE) {
                    vurdertIkkeBehov++;
                } else if (vurdering == PvkVurdering.ALLEREDE_UTFORT) {
                    pvkIWord++;
                    pvkTotal++;
                } else if (vurdering == null || vurdering == PvkVurdering.UNDEFINED) {
                    ikkeVurdertBehov++;
                } else {
                    behovIkkePaabegynt++;
                    pvkTotal++;
                    var pvkDokData = pvk.getFirst().getPvkDokumentData();
                    List<Risikoscenario> risikoscenarioer = risikoscenarioService.getByPvkDokument(pvk.getFirst().getId().toString(), RisikoscenarioType.ALL);
                    var relevantMeldingTilPvo = pvkDokData.getMeldingerTilPvo().stream()
                            .filter(melding -> melding.getInnsendingId() == pvkDokData.getAntallInnsendingTilPvo())
                            .toList();
                    boolean hasPvkStarted = false;
                    if (!risikoscenarioer.isEmpty()) {
                        hasPvkStarted = true;
                    }
                    if (!relevantMeldingTilPvo.isEmpty() && relevantMeldingTilPvo.getFirst().getMerknadTilPvo() != null && !Objects.equals(relevantMeldingTilPvo.getFirst().getMerknadTilPvo(), "")) {
                        hasPvkStarted = true;
                    }
                    if (pvkDokData.getHarInvolvertRepresentant() != null || pvkDokData.getHarDatabehandlerRepresentantInvolvering() != null ||
                            (pvkDokData.getRepresentantInvolveringsBeskrivelse() != null && !Objects.equals(pvkDokData.getRepresentantInvolveringsBeskrivelse(), "")) ||
                            (pvkDokData.getDataBehandlerRepresentantInvolveringBeskrivelse() != null && !Objects.equals(pvkDokData.getDataBehandlerRepresentantInvolveringBeskrivelse(), ""))) {
                        hasPvkStarted = true;
                    } else {
                        hasPvkStarted = false;
                    }
                    if (!hasPvkStarted) {
                        pvkIkkePaabegynt++;
                    } else {
                        var pvkStatus = pvk.getFirst().getStatus();
                        if (pvkStatus == PvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
                            pvkGodkjent++;
                        } else if (pvkStatus == PvkDokumentStatus.SENDT_TIL_PVO
                                || pvkStatus == PvkDokumentStatus.PVO_UNDERARBEID
                                || pvkStatus == PvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING) {
                            pvkTilBehandlingPvo++;
                        } else if (pvkStatus == PvkDokumentStatus.VURDERT_AV_PVO
                                || pvkStatus == PvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID) {
                            pvkTilbakemeldingPvo++;
                        } else {
                            pvkUnderArbeid++;
                        }
                    }
                }
            }
        }

        avdelingResponse.setBehovForPvk(BehovForPvkStats.builder()
                .totalMedPersonopplysninger(totalMedPO)
                .ikkeVurdertBehov(ikkeVurdertBehov)
                .vurdertIkkeBehov(vurdertIkkeBehov)
                .behovIkkePaabegynt(behovIkkePaabegynt)
                .build());

        avdelingResponse.setPvk(PvkStats.builder()
                .total(pvkTotal)
                .ikkePaabegynt(pvkIkkePaabegynt)
                .underArbeid(pvkUnderArbeid)
                .tilBehandlingHosPvo(pvkTilBehandlingPvo)
                .tilbakemeldingFraPvo(pvkTilbakemeldingPvo)
                .godkjentAvRisikoeier(pvkGodkjent)
                .pvkIWord(pvkIWord)
                .build());
    }

    private SuksesskriterierStats getSuksesskriterierStats(List<Etterlevelse> etterlevelser) {
        int totalSuksesskriterier = 0;
        int underArbeidAntall = 0;
        int oppfyltAntall = 0;
        int ikkeOppfyltAntall = 0;
        int ikkeRelevantAntall = 0;

        for (Etterlevelse etterlevelse : etterlevelser) {
            totalSuksesskriterier += etterlevelse.getSuksesskriterieBegrunnelser().size();

            for (SuksesskriterieBegrunnelse suksesskriterieBegrunnelse : etterlevelse.getSuksesskriterieBegrunnelser()) {
                if (suksesskriterieBegrunnelse.getSuksesskriterieStatus() == SuksesskriterieStatus.UNDER_ARBEID) {
                    underArbeidAntall += 1;
                } else if (suksesskriterieBegrunnelse.getSuksesskriterieStatus() == SuksesskriterieStatus.OPPFYLT) {
                    oppfyltAntall += 1;
                } else if (suksesskriterieBegrunnelse.getSuksesskriterieStatus() == SuksesskriterieStatus.IKKE_OPPFYLT) {
                    ikkeOppfyltAntall += 1;
                } else {
                    ikkeRelevantAntall += 1;
                }
            }
        }

        return SuksesskriterierStats.builder()
                .underArbeidProsent(totalSuksesskriterier > 0 ? Math.round((float) underArbeidAntall / totalSuksesskriterier * 100) : 0)
                .oppfyltProsent(totalSuksesskriterier > 0 ? Math.round((float) oppfyltAntall / totalSuksesskriterier * 100) : 0)
                .ikkeOppfyltProsent(totalSuksesskriterier > 0 ? Math.round((float) ikkeOppfyltAntall / totalSuksesskriterier * 100) : 0)
                .ikkeRelevantProsent(totalSuksesskriterier > 0 ? Math.round((float) ikkeRelevantAntall / totalSuksesskriterier * 100) : 0)
                .build();
    }

    public List<TemaDashboardResponse> getTemaDashboardStats(String avdelingId, String seksjonId) {
        List<EtterlevelseDokumentasjon> doks;

        if (avdelingId != null && !avdelingId.isEmpty()) {
            String effectiveAvdelingId = "ingen-avdeling".equals(avdelingId) ? "" : avdelingId;
            doks = etterlevelseDokumentasjonService.getByAvdeling(effectiveAvdelingId);

            if (seksjonId != null && !seksjonId.isEmpty()) {
                if (seksjonId.equals("ingen-seksjon")) {
                    doks = doks.stream().filter(d ->
                            d.getEtterlevelseDokumentasjonData().getSeksjoner() == null ||
                            d.getEtterlevelseDokumentasjonData().getSeksjoner().isEmpty()
                    ).toList();
                } else {
                    doks = doks.stream().filter(d ->
                            d.getEtterlevelseDokumentasjonData().getSeksjoner() != null &&
                            d.getEtterlevelseDokumentasjonData().getSeksjoner().stream()
                                    .anyMatch(ns -> seksjonId.equals(ns.getNomSeksjonId()))
                    ).toList();
                }
            }
        } else {
            doks = etterlevelseDokumentasjonService.getAll(org.springframework.data.domain.Pageable.unpaged()).getContent();
        }

        var dokIds = doks.stream().map(EtterlevelseDokumentasjon::getId).toList();
        var etterlevelseByDokId = etterlevelseService.getByEtterlevelseDokumentasjoner(dokIds);

        var aktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<Krav> utgaattKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.UTGAATT.name())).build());
        List<Krav> utgaatKravUtenNyVersjon = utgaattKrav.stream()
                .filter(uk -> aktivKrav.stream().noneMatch(ak -> ak.getKravNummer().equals(uk.getKravNummer())))
                .toList();

        Map<String, String> temaByKravKey = new HashMap<>();
        for (var krav : aktivKrav) {
            String key = krav.getKravNummer() + "_" + krav.getKravVersjon();
            temaByKravKey.put(key, resolveTemaCodeFromKrav(krav));
        }
        for (var krav : utgaatKravUtenNyVersjon) {
            String key = krav.getKravNummer() + "_" + krav.getKravVersjon();
            temaByKravKey.put(key, resolveTemaCodeFromKrav(krav));
        }

        Map<String, TemaDashboardResponse> statsMap = new LinkedHashMap<>();

        for (var dok : doks) {
            List<Krav> kravForEdok = new ArrayList<>(aktivKrav.stream().filter(k ->
                    !new HashSet<>(dok.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
            ).toList());

            kravForEdok.addAll(utgaatKravUtenNyVersjon.stream().filter(k ->
                    !new HashSet<>(dok.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
            ).toList());

            var gyldigeKravKeys = new HashSet<String>();
            kravForEdok.forEach(k -> gyldigeKravKeys.add(k.getKravNummer() + "_" + k.getKravVersjon()));

            var etterlevelseList = etterlevelseByDokId.getOrDefault(dok.getId(), List.of());

            for (var etterlevelse : etterlevelseList) {
                String kravKey = etterlevelse.getKravNummer() + "_" + etterlevelse.getKravVersjon();

                if (!gyldigeKravKeys.contains(kravKey)) continue;

                String temaCode = temaByKravKey.getOrDefault(kravKey, "UTEN_TEMA");

                var stats = statsMap.computeIfAbsent(temaCode, tc -> {
                    if ("UTEN_TEMA".equals(tc)) {
                        return TemaDashboardResponse.builder().temaCode(tc).temaName("Uten tema").build();
                    }
                    var temaData = CodelistService.getCodelist(ListName.TEMA, tc);
                    String temaName = temaData != null ? temaData.getShortName() : tc;
                    return TemaDashboardResponse.builder().temaCode(tc).temaName(temaName).build();
                });

                boolean isFerdig = etterlevelse.getStatus() == EtterlevelseStatus.FERDIG_DOKUMENTERT
                        || etterlevelse.getStatus() == EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT;

                stats.setKravTotal(stats.getKravTotal() + 1);
                if (isFerdig) {
                    stats.setKravFerdigVurdert(stats.getKravFerdigVurdert() + 1);
                } else {
                    stats.setKravUnderArbeid(stats.getKravUnderArbeid() + 1);
                }

                for (var sb : etterlevelse.getSuksesskriterieBegrunnelser()) {
                    switch (sb.getSuksesskriterieStatus()) {
                        case UNDER_ARBEID -> stats.setSuksesskriterierUnderArbeid(stats.getSuksesskriterierUnderArbeid() + 1);
                        case OPPFYLT -> stats.setSuksesskriterierOppfylt(stats.getSuksesskriterierOppfylt() + 1);
                        case IKKE_OPPFYLT -> stats.setSuksesskriterierIkkeOppfylt(stats.getSuksesskriterierIkkeOppfylt() + 1);
                        case IKKE_RELEVANT -> stats.setSuksesskriterierIkkeRelevant(stats.getSuksesskriterierIkkeRelevant() + 1);
                    }

                    if (isFerdig) {
                        switch (sb.getSuksesskriterieStatus()) {
                            case UNDER_ARBEID -> {}
                            case OPPFYLT -> stats.setFerdigUtfyltKravSuksesskriterierOppfylt(stats.getFerdigUtfyltKravSuksesskriterierOppfylt() + 1);
                            case IKKE_OPPFYLT -> stats.setFerdigUtfyltKravSuksesskriterierIkkeOppfylt(stats.getFerdigUtfyltKravSuksesskriterierIkkeOppfylt() + 1);
                            case IKKE_RELEVANT -> stats.setFerdigUtfyltKravSuksesskriterierIkkeRelevant(stats.getFerdigUtfyltKravSuksesskriterierIkkeRelevant() + 1);
                        }
                    }
                }
            }
        }

        return statsMap.values().stream()
                .sorted(Comparator.comparing(TemaDashboardResponse::getTemaName))
                .toList();
    }

    private String resolveTemaCodeFromKrav(Krav krav) {
        var regelverk = krav.getRegelverk();
        if (regelverk == null || regelverk.isEmpty()) return "UTEN_TEMA";

        String lovCode = regelverk.get(0).getLov();
        if (lovCode == null) return "UTEN_TEMA";

        var lovData = CodelistService.getCodelist(ListName.LOV, lovCode);
        if (lovData == null) return "UTEN_TEMA";

        String tema = lovData.getValueFromKeyData("tema");
        return tema != null && !tema.isBlank() ? tema : "UTEN_TEMA";
    }
}
