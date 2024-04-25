package no.nav.data.etterlevelse.statistikk;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.dto.AuditLogResponse;
import no.nav.data.common.auditing.dto.AuditResponse;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieBegrunnelse;
import no.nav.data.etterlevelse.etterlevelse.domain.SuksesskriterieStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.TilbakemeldingService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.statistikk.domain.BehandlingStatistikk;
import no.nav.data.etterlevelse.statistikk.dto.EtterlevelseStatistikkResponse;
import no.nav.data.etterlevelse.statistikk.dto.KravStatistikkResponse;
import no.nav.data.etterlevelse.statistikk.dto.TilbakemeldingStatistikkResponse;
import no.nav.data.integration.behandling.BehandlingService;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.team.teamcat.TeamcatTeamClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatistikkService {
    private final TilbakemeldingService tilbakemeldingService;
    private final BehandlingService behandlingService;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final TeamcatTeamClient teamService;

    private final AuditVersionRepository auditVersionRepository;

    public int getAntallIkkeFiltrertKrav(List<Krav> aktivKravList, EtterlevelseDokumentasjon etterlevelseDokumentasjon, List<Etterlevelse> etterlevelseList) {

        List<Krav> valgteKrav = aktivKravList.stream()
                .filter(krav -> !new HashSet<>(etterlevelseDokumentasjon.getIrrelevansFor()).containsAll(krav.getRelevansFor()) || krav.getRelevansFor().isEmpty())
                .toList();

        return valgteKrav.size() +
                etterlevelseList.stream()
                        .filter(etterlevelse ->
                                valgteKrav.stream().noneMatch(krav -> krav.getKravVersjon().equals(etterlevelse.getKravVersjon()) &&
                                        krav.getKravNummer().equals(etterlevelse.getKravNummer()))
                        ).toList().size();
    }

    public LocalDateTime getFirstCreatedDateForEtterlevelser(List<Etterlevelse> etterlevelseList) {
        etterlevelseList.sort(Comparator.comparing(a -> a.getChangeStamp().getCreatedDate()));
        return !etterlevelseList.isEmpty() ? etterlevelseList.get(0).getChangeStamp().getCreatedDate().withNano(0) : null;
    }

    public LocalDateTime getLastUpdatedDateForEtterlevelser(List<Etterlevelse> etterlevelseList) {
        etterlevelseList.sort(Comparator.comparing(a -> a.getChangeStamp().getLastModifiedDate()));
        return !etterlevelseList.isEmpty() ? etterlevelseList.get(etterlevelseList.size() - 1).getChangeStamp().getLastModifiedDate().withNano(0) : null;
    }

    public Page<TilbakemeldingStatistikkResponse> getAllTilbakemeldingStatistikk(Pageable page) {
        Page<Tilbakemelding> tilbakeMeldinger = tilbakemeldingService.getAll(page);
        List<TilbakemeldingStatistikkResponse> tilbakemeldingStatistikkResponses = new ArrayList<>();

        tilbakeMeldinger.forEach(tb -> {
            var tempKrav = kravService.getByKravNummer(tb.getKravNummer(), tb.getKravVersjon());
            tempKrav.ifPresent(krav -> tilbakemeldingStatistikkResponses.add(TilbakemeldingStatistikkResponse.builder()
                    .id(tb.getId().toString())
                    .kravTittel(krav.getNavn())
                    .kravNummer(tb.getKravNummer())
                    .kravVersjon(tb.getKravVersjon())
                    .mottattTid(tb.getMeldinger().get(0).getTid().withNano(0))
                    .besvartTid(getTilbakemeldingStatus(tb) == TilbakemeldingStatus.UBESVART ? null : tb.getMeldinger().get(tb.getMeldinger().size() - 1).getTid().withNano(0))
                    .fortTilKravEndring(tb.isEndretKrav())
                    .status(getTilbakemeldingStatus(tb).name())
                    .build()));
        });
        return new PageImpl<>(tilbakemeldingStatistikkResponses, page, tilbakemeldingStatistikkResponses.size());
    }

    public Page<BehandlingStatistikk> getAllBehandlingStatistikk(Pageable page) {
        List<BehandlingStatistikk> behandlingStatistikkList = new ArrayList<>();

        AtomicInteger totalElements = new AtomicInteger();

        List<Krav> aktivKravList = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());

        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjoner = etterlevelseDokumentasjonService.getAllWithValidBehandling();

        etterlevelseDokumentasjoner.forEach(etterlevelseDokumentasjon -> {

            totalElements.addAndGet(etterlevelseDokumentasjon.getBehandlingIds().size());

            //Get all etterlevelse for behandling
            List<Etterlevelse> etterlevelseList = etterlevelseService.getByEtterlevelseDokumentasjon(String.valueOf(etterlevelseDokumentasjon.getId()));

            LocalDateTime opprettetDato = getFirstCreatedDateForEtterlevelser(etterlevelseList);

            LocalDateTime endretDato = getLastUpdatedDateForEtterlevelser(etterlevelseList);

            //Filter etterlevelse to only have documentation for active Krav
            List<Etterlevelse> aktivEtterlevelseList = etterlevelseList.stream().filter(etterlevelse ->
                    aktivKravList.stream().anyMatch(krav -> krav.getKravNummer().equals(etterlevelse.getKravNummer()) && krav.getKravVersjon().equals(etterlevelse.getKravVersjon()))
            ).toList();

            int antallIkkeFiltrertKrav = getAntallIkkeFiltrertKrav(aktivKravList, etterlevelseDokumentasjon, aktivEtterlevelseList);

            List<Etterlevelse> antallFerdigDokumentert = aktivEtterlevelseList.stream()
                    .filter(etterlevelse ->
                            etterlevelse.getStatus().equals(EtterlevelseStatus.FERDIG_DOKUMENTERT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.OPPFYLLES_SENERE)
                    )
                    .toList();

            List<Etterlevelse> antallUnderArbeid = aktivEtterlevelseList.stream()
                    .filter(etterlevelse ->
                            etterlevelse.getStatus().equals(EtterlevelseStatus.UNDER_REDIGERING) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.IKKE_RELEVANT) ||
                                    etterlevelse.getStatus().equals(EtterlevelseStatus.FERDIG)
                    )
                    .toList();

            String ansvarlig;

            if(etterlevelseDokumentasjon.getAvdeling() != null && !etterlevelseDokumentasjon.getAvdeling().isEmpty()) {
                ansvarlig = CodelistService.getCodelist(ListName.AVDELING, etterlevelseDokumentasjon.getAvdeling()).getShortName();
            } else {
                ansvarlig = "";
            }

            int antallUnderArbeidSize = antallUnderArbeid.stream().filter(etterlevelseUnderArbeid ->
                    antallFerdigDokumentert.stream()
                            .noneMatch(e -> e.getKravNummer().equals(etterlevelseUnderArbeid.getKravNummer())
                                    && e.getKravVersjon().equals(etterlevelseUnderArbeid.getKravVersjon()))
            ).toList().size();


            etterlevelseDokumentasjon.getBehandlingIds().forEach(behandlingId -> {
                Behandling behandling = new Behandling();

                try {
                    behandling = behandlingService.getBehandling(behandlingId);
                } catch (Exception e) {
                    log.error("failed to get behandling: " + e);
                }

                if(behandling.getId() != null &&  !behandling.getId().isEmpty()) {
                    String behandlingNavn = "B" + behandling.getNummer() + " " + behandling.getNavn();

                    List<String> teamNames = behandling.getTeams().stream().map(t -> teamService.getTeam(t).isPresent() ? teamService.getTeam(t).get().getName() : "").toList();

                    behandlingStatistikkList.add(
                            BehandlingStatistikk.builder()
                                    .etterlevelseDokumentasjonsId(etterlevelseDokumentasjon.getId().toString())
                                    .etterlevelseDokumentasjonTittel("E" + etterlevelseDokumentasjon.getEtterlevelseNummer() + " " + etterlevelseDokumentasjon.getTitle())
                                    .behandlingId(behandling.getId())
                                    .behandlingNavn(behandlingNavn)
                                    .ansvarligId(etterlevelseDokumentasjon.getAvdeling())
                                    .ansvarlig(ansvarlig)
                                    .totalKrav(aktivKravList.size())
                                    .antallIkkeFiltrertKrav(antallIkkeFiltrertKrav)
                                    .antallBortfiltrertKrav(aktivKravList.size() - antallIkkeFiltrertKrav)
                                    .antallFerdigDokumentert(antallFerdigDokumentert.size())
                                    .antallUnderArbeid(antallUnderArbeidSize)
                                    .antallIkkePaabegynt(antallIkkeFiltrertKrav - (antallFerdigDokumentert.size() + antallUnderArbeidSize))
                                    .endretDato(endretDato)
                                    .opprettetDato(opprettetDato)
                                    .team(teamNames)
                                    .teamId(behandling.getTeams())
                                    .build()
                    );
                }
            });
        });

        if ((page.getPageNumber() * page.getPageSize()) > behandlingStatistikkList.size()) {
            return new PageImpl<>(new ArrayList<>(), page, totalElements.get());
        }
        if ((page.getPageNumber() * page.getPageSize()) + page.getPageSize() >= behandlingStatistikkList.size()) {
            return new PageImpl<>(behandlingStatistikkList.subList(page.getPageNumber() * page.getPageSize(), behandlingStatistikkList.size()), page, totalElements.get());
        } else {
            return new PageImpl<>(behandlingStatistikkList.subList(page.getPageNumber() * page.getPageSize(), (page.getPageNumber() * page.getPageSize()) + page.getPageSize()), page, totalElements.get());
        }
    }

    public EtterlevelseStatistikkResponse toEtterlevelseStatistikkResponse(Etterlevelse etterlevelse) {
        EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonService.get(UUID.fromString(etterlevelse.getEtterlevelseDokumentasjonId()));
        LocalDateTime ferdigDokumentertDato = null;

        if (etterlevelse.getStatus() == EtterlevelseStatus.FERDIG_DOKUMENTERT || etterlevelse.getStatus() == EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) {
            List<AuditVersion> etterlevelseLog = auditVersionRepository.findByTableIdOrderByTimeDesc(etterlevelse.getId().toString());

            List<AuditResponse> etterlevelseAudits = new AuditLogResponse(etterlevelse.getId().toString(), convert(etterlevelseLog, AuditVersion::toResponse))
                    .getAudits().stream().filter(audit ->
                            Objects.equals(audit.getData().get("data").get("status").asText(), etterlevelse.getStatus().name())
                    ).toList();

            //Because of migration script some etterlevelser has no audit record of being set to ferdig_dokumentert or ikke_relevant_ferdig_dokumentert
            if (!etterlevelseAudits.isEmpty()) {
                ferdigDokumentertDato = LocalDateTime.parse(etterlevelseAudits.get(etterlevelseAudits.size() - 1).getData().get("lastModifiedDate").asText()).withNano(0);
            } else {
                ferdigDokumentertDato = etterlevelse.getChangeStamp().getLastModifiedDate().withNano(0);
            }
        }

        List<String> teamNames = etterlevelseDokumentasjon.getTeams().stream().map(t -> teamService.getTeam(t).isPresent() ? teamService.getTeam(t).get().getName() : "").toList();
        String ansvarlig;

        if(etterlevelseDokumentasjon.getAvdeling() != null && !etterlevelseDokumentasjon.getAvdeling().isEmpty()) {
            ansvarlig = CodelistService.getCodelist(ListName.AVDELING, etterlevelseDokumentasjon.getAvdeling()).getShortName();
        } else {
            ansvarlig = "";
        }

        String temaName = "Ingen";
        var krav = kravService.getByKravNummer(etterlevelse.getKravNummer(), etterlevelse.getKravVersjon());

        if (krav.isPresent()) {
            var regelverkResponse = StreamUtils.convert(krav.get().getRegelverk(), Regelverk::toResponse);
            if (!regelverkResponse.isEmpty()) {
                var temaData = CodelistService.getCodelist(ListName.TEMA, regelverkResponse.get(0).getLov().getData().get("tema").textValue());
                if (temaData != null) {
                    temaName = temaData.getShortName();
                }
            }
        }

        return EtterlevelseStatistikkResponse.builder()
                .id(etterlevelse.getId())
                .etterlevelseDokumentasjonId(etterlevelse.getEtterlevelseDokumentasjonId())
                .etterlevelseDokumentasjonTittel(etterlevelseDokumentasjon.getTitle())
                .etterlevelseDokumentasjonNummer("E" + etterlevelseDokumentasjon.getEtterlevelseNummer().toString())
                .ansvarligId(etterlevelseDokumentasjon.getAvdeling())
                .ansvarlig(ansvarlig)
                .kravNummer(etterlevelse.getKravNummer())
                .kravVersjon(etterlevelse.getKravVersjon())
                .etterleves(etterlevelse.isEtterleves())
                .dokumentasjon(etterlevelse.getDokumentasjon())
                .fristForFerdigstillelse(etterlevelse.getFristForFerdigstillelse())
                .status(etterlevelse.getStatus())
                .suksesskriterieBegrunnelser(etterlevelse.toResponse().getSuksesskriterieBegrunnelser())
                .statusBegrunnelse(etterlevelse.getStatusBegrunnelse())
                .lastModifiedDate(etterlevelse.getChangeStamp().getLastModifiedDate().withNano(0))
                .createdDate(etterlevelse.getChangeStamp().getCreatedDate().withNano(0))
                .ferdigDokumentertDato(ferdigDokumentertDato)
                .antallSuksesskriterie(etterlevelse.getSuksesskriterieBegrunnelser().size())
                .teamId(etterlevelseDokumentasjon.getTeams())
                .team(teamNames)
                .tema(temaName)
                .oppfyltSuksesskriterieIder(
                        etterlevelse.getSuksesskriterieBegrunnelser().stream()
                                .filter(sb -> sb.getSuksesskriterieStatus() == SuksesskriterieStatus.OPPFYLT)
                                .map(SuksesskriterieBegrunnelse::getSuksesskriterieId).toList()
                )
                .ikkeOppfyltSuksesskriterieIder(
                        etterlevelse.getSuksesskriterieBegrunnelser().stream()
                                .filter(sb -> sb.getSuksesskriterieStatus() == SuksesskriterieStatus.IKKE_OPPFYLT)
                                .map(SuksesskriterieBegrunnelse::getSuksesskriterieId).toList()
                )
                .underArbeidSuksesskriterieIder(
                        etterlevelse.getSuksesskriterieBegrunnelser().stream()
                                .filter(sb -> sb.getSuksesskriterieStatus() == SuksesskriterieStatus.UNDER_ARBEID)
                                .map(SuksesskriterieBegrunnelse::getSuksesskriterieId).toList()
                )
                .ikkeRelevantSuksesskriterieIder(
                        etterlevelse.getSuksesskriterieBegrunnelser().stream()
                                .filter(sb -> sb.getSuksesskriterieStatus() == SuksesskriterieStatus.IKKE_RELEVANT)
                                .map(SuksesskriterieBegrunnelse::getSuksesskriterieId).toList()
                )
                .build();
    }


    public KravStatistikkResponse toKravStatestikkResponse(Krav krav) {
        var regelverkResponse = StreamUtils.convert(krav.getRegelverk(), Regelverk::toResponse);
        String temaName = "Ingen";
        boolean harNyVersjon = false;

        LocalDateTime aktivertDato = krav.getAktivertDato() == null ? null : krav.getAktivertDato().withNano(0);
        List<AuditVersion> kravLog = auditVersionRepository.findByTableIdOrderByTimeDesc(krav.getId().toString());
        AuditLogResponse kravAudits = new AuditLogResponse(krav.getId().toString(), convert(kravLog, AuditVersion::toResponse));

        List<LocalDateTime> oppdateringsTidsPunkter = kravAudits.getAudits().stream()
                .filter(audit -> audit.getAction().equals(Action.UPDATE))
                .map(audit -> audit.getTime().withNano(0)).toList();

        if (!regelverkResponse.isEmpty()) {
            var temaData = CodelistService.getCodelist(ListName.TEMA, regelverkResponse.get(0).getLov().getData().get("tema").textValue());
            if (temaData != null) {
                temaName = temaData.getShortName();
            }
        }

        if (aktivertDato == null && (krav.getStatus().equals(KravStatus.AKTIV) || krav.getStatus().equals(KravStatus.UTGAATT))) {
            List<AuditResponse> filteredKravAudits = kravAudits.getAudits().stream().filter(audit ->
                    Objects.equals(audit.getData().get("data").get("status").asText(), KravStatus.AKTIV.name())
            ).toList();
            aktivertDato = LocalDateTime.parse(filteredKravAudits.get(filteredKravAudits.size() - 1).getData().get("lastModifiedDate").asText()).withNano(0);
        }

        if (krav.getStatus() == KravStatus.UTGAATT) {
            Optional<Krav> nyKravVersjon = kravService.getByKravNummer(krav.getKravNummer(), krav.getKravVersjon() + 1);
            if (nyKravVersjon.isPresent()) {
                harNyVersjon = true;
            }
        }

        return KravStatistikkResponse.builder()
                .id(krav.getId())
                .lastModifiedDate(krav.getChangeStamp().getLastModifiedDate().withNano(0))
                .createdDate(krav.getChangeStamp().getCreatedDate().withNano(0))
                .kravNummer(krav.getKravNummer())
                .kravVersjon(krav.getKravVersjon())
                .navn(krav.getNavn())
                .regelverk(regelverkResponse)
                .tagger(krav.getTagger())
                .suksesskriterier(StreamUtils.convert(krav.getSuksesskriterier(), Suksesskriterie::toResponse))
                .kravIdRelasjoner(krav.getKravIdRelasjoner())
                .avdeling(CodelistService.getCodelistResponse(ListName.AVDELING, krav.getAvdeling()))
                .underavdeling(CodelistService.getCodelistResponse(ListName.UNDERAVDELING, krav.getUnderavdeling()))
                .relevansFor(CodelistService.getCodelistResponseList(ListName.RELEVANS, krav.getRelevansFor()))
                .status(krav.getStatus())
                .aktivertDato(aktivertDato)
                .tema(temaName)
                .harNyVersjon(harNyVersjon)
                .oppdateringsTidsPunkter(oppdateringsTidsPunkter)
                .build();
    }

    public Page<Krav> getAllKravStatistics(Pageable page) {
        return kravService.getAllKravStatistics(page);
    }

    public Page<Etterlevelse> getAllEtterlevelseStatistics(Pageable page) {
        return etterlevelseService.getAllEtterlevelseStatistics(page);
    }

    private TilbakemeldingStatus getTilbakemeldingStatus(Tilbakemelding tilbakemelding) {
        if (tilbakemelding.getStatus() != null) {
            return tilbakemelding.getStatus();
        } else if (tilbakemelding.getMeldinger().get(tilbakemelding.getMeldinger().size() - 1).getRolle() == Tilbakemelding.Rolle.KRAVEIER) {
            return TilbakemeldingStatus.BESVART;
        } else {
            return TilbakemeldingStatus.UBESVART;
        }
    }
}
