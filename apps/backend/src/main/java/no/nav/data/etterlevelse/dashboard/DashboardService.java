package no.nav.data.etterlevelse.dashboard;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import no.nav.data.etterlevelse.dashboard.dto.*;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieBegrunnelse;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;
import no.nav.data.pvk.pvkdokument.PvkDokumentService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonStatus;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.integration.nom.NomGraphClient;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvkdokument.domain.PvkVurdering;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final EtterlevelseService etterlevelseService;
    private final KravService kravService;
    private final PvkDokumentService pvkDokumentService;
    private final NomGraphClient nomGraphClient;

    public List<DashboardResponse> getDashboardStats() {
        var avdelinger = nomGraphClient.getAllAvdelinger();
        var result = new ArrayList<DashboardResponse>();
        for (var avdeling : avdelinger) {
            var stats = getAvdelingStats(avdeling.getId());
            result.add(stats);
        }
        return result;
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

        var dokIds = allDoks.stream().map(EtterlevelseDokumentasjon::getId).toList();
        var etterlevelseByDokId = etterlevelseService.getByEtterlevelseDokumentasjoner(dokIds);

        var result = createAvdelingDashBoardResponse(avdelingId, avdelingNavn, allDoks, pvkByDokId, aktivKrav, etterlevelseByDokId);

        var seksjonerFromNom = nomGraphClient.getAllSeksjonForAvdeling(avdelingId);

        var seksjonOptions = seksjonerFromNom.stream()
                .map(s -> SeksjonOption.builder().id(s.getId()).navn(s.getNavn()).build())
                .sorted(Comparator.comparing(SeksjonOption::getNavn))
                .toList();

        Map<String, DashboardResponse> statsBySeksjon = new LinkedHashMap<>();
        for (var seksjon : seksjonerFromNom) {
            var seksjonDoks = allDoks.stream()
                    .filter(d -> d.getEtterlevelseDokumentasjonData().getSeksjoner() != null
                            && d.getEtterlevelseDokumentasjonData().getSeksjoner().stream()
                            .anyMatch(ns -> seksjon.getId().equals(ns.getNomSeksjonId())))
                    .toList();
            var seksjonStats = createAvdelingDashBoardResponse(seksjon.getId(), seksjon.getNavn(), seksjonDoks, pvkByDokId, aktivKrav, etterlevelseByDokId);
            statsBySeksjon.put(seksjon.getId(), seksjonStats);
        }

        result.setSeksjoner(seksjonOptions);
        result.setStatsBySeksjon(statsBySeksjon);

        return result;

    }

    private DashboardResponse createAvdelingDashBoardResponse(
            String avdelingId,
            String avdelingNavn,
            List<EtterlevelseDokumentasjon> doks,
            List<PvkDokument> pvkDokumenter,
            List<Krav> aktivKrav,
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
            var aktivEtterlevelseList = etterlevelseList.stream()
                    .filter(e -> aktivKrav.stream().anyMatch(k ->
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
        int pvkUnderArbeid = 0;
        int pvkTilBehandlingPvo = 0;
        int pvkTilbakemeldingPvo = 0;
        int pvkGodkjent = 0;
        int pvkIWord = 0;

        for (var dok : etterlevelseDokumentasjonsWithPersonOpplysning) {
            List<PvkDokument> pvk = pvkDokumenter.stream().filter(p -> p.getEtterlevelseDokumentId().equals(dok.getId())).toList();
            if (pvk.isEmpty()) {
                ikkeVurdertBehov++;
            }

            var vurdering = pvk.getFirst().getPvkDokumentData().getPvkVurdering();
            if (vurdering == PvkVurdering.SKAL_IKKE_UTFORE) {
                vurdertIkkeBehov++;
            } else if (vurdering == PvkVurdering.ALLEREDE_UTFORT) {
                pvkIWord++;
                pvkTotal++;
            } else if (vurdering == null || vurdering == PvkVurdering.UNDEFINED) {
                ikkeVurdertBehov++;
            } else {
                pvkTotal++;
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

        avdelingResponse.setBehovForPvk(BehovForPvkStats.builder()
                .totalMedPersonopplysninger(totalMedPO)
                .ikkeVurdertBehov(ikkeVurdertBehov)
                .vurdertIkkeBehov(vurdertIkkeBehov)
                .behovIkkePaabegynt(behovIkkePaabegynt)
                .build());

        avdelingResponse.setPvk(PvkStats.builder()
                .total(pvkTotal)
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
}
