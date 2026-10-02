package no.nav.data.etterlevelse.etterlevelseDokumentasjon;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.varsel.UrlGenerator;
import no.nav.data.etterlevelse.varsel.VarselService;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioRepo;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakRepo;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static no.nav.data.etterlevelse.varsel.domain.Varsel.Paragraph.VarselUrl.url;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtterlevelseDokumentasjonVarselService {
    private final VarselService varselService;
    private final UrlGenerator urlGenerator;
    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    private final EtterlevelseRepo etterlevelseRepo;
    private final PvkDokumentRepo pvkDokumentRepo;
    private final TiltakRepo tiltakRepo;
    private final RisikoscenarioRepo risikoscenarioRepo;

    // Run at 07:00 on the first day of every month
    @SchedulerLock(name = "sendVarselForEtterlevelseDokNotUpdated6months")
    @Scheduled(cron = "0 0 7 1 * *")
    public void sendVarselForEtterlevelseDokumentasjonThatHasNotBeenUpatedfor6months() {
        log.info("Running check for etterlevelseDokumentasjon that has not been updated for 6 months");
        YearMonth now = YearMonth.now();

        //henter alle etterlevelse, pvkDokument, risikoscenario og tiltak som har lastModified eldre enn 6 måneder
        // og deretter filtrerer jeg ut de som er multiplum av 6 måneder (er med dersom de har går 6, 12, 18, 24, 30, 36, osv.. måneder siden sist endret)
        List<Etterlevelse> recentEtterlevelseOlderThan6monthsPerEtterlevelseDoc = etterlevelseRepo.findOnePerDokumentasjonMedLastModifiedEldreEnn6mnd().stream()
                .filter(etterlevelse -> isMultipleOf6Months(now, etterlevelse.getLastModifiedDate()))
                .toList();
        List<PvkDokument> recentPvkDokumentOlderThan6months = pvkDokumentRepo.findPvkDokumentMedLastModifiedEldreEnn6mnd().stream()
                .filter(pvkDokument -> isMultipleOf6Months(now, pvkDokument.getLastModifiedDate()))
                .toList();
        List<Risikoscenario> recentRisikoscenarioOlderThan6monthsPerPvkDokument = risikoscenarioRepo.findOnePerDokumentasjonMedLastModifiedEldreEnn6mnd().stream()
                .filter(risikoscenario -> isMultipleOf6Months(now, risikoscenario.getLastModifiedDate()))
                .toList();
        List<Tiltak> recentTiltakOlderThan6monthsPerPvkDokument = tiltakRepo.findOnePerDokumentasjonMedLastModifiedEldreEnn6mnd().stream()
                .filter(tiltak -> isMultipleOf6Months(now, tiltak.getLastModifiedDate()))
                .toList();

        //Samler alle pvkDokumentId'er fra risikoscenario og tiltak
        List<UUID> pvkDokumentIds = Stream.concat(
                        recentRisikoscenarioOlderThan6monthsPerPvkDokument.stream().map(Risikoscenario::getPvkDokumentId),
                        recentTiltakOlderThan6monthsPerPvkDokument.stream().map(Tiltak::getPvkDokumentId))
                .distinct()
                .toList();

        // Sammeligner ider jeg fikk over med ider som finnes i recentPvkDokumentOlderThan6months
        // og deretter finne PvkDokument for de som ikke er med i lista
        Set<UUID> existingPvkDokumentIds = recentPvkDokumentOlderThan6months.stream()
                .map(PvkDokument::getId)
                .collect(Collectors.toSet());

        List<UUID> missingPvkDokumentIds = pvkDokumentIds.stream()
                .filter(id -> !existingPvkDokumentIds.contains(id))
                .toList();

        List<PvkDokument> missingPvkDokumenter = pvkDokumentRepo.findAllById(missingPvkDokumentIds);


        //Samler alle etterlevelseDokumentasjonId'er fra listene over for å få varslet ut via varslingsadresser som er lagret i etterlevelseDokumentasjon
        List<UUID> etterlevelseDokumentIds = Stream.of(
                        missingPvkDokumenter.stream().map(PvkDokument::getEtterlevelseDokumentId),
                        recentPvkDokumentOlderThan6months.stream().map(PvkDokument::getEtterlevelseDokumentId),
                        recentEtterlevelseOlderThan6monthsPerEtterlevelseDoc.stream().map(Etterlevelse::getEtterlevelseDokumentasjonId))
                .flatMap(stream -> stream)
                .distinct()
                .toList();

        etterlevelseDokumentasjonRepo.findAllById(etterlevelseDokumentIds)
                .forEach(etterlevelseDokumentasjon -> {
                    if (etterlevelseDokumentasjon.getVarslingsadresser() != null && !etterlevelseDokumentasjon.getVarslingsadresser().isEmpty()) {
                        String etterlevelseNummmer = "E%s.%s".formatted(etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseDokumentasjon.getEtterlevelseDokumentVersjon());
                        String etterlevelseDokumentasjonKortTittel = "%s %s".formatted(etterlevelseNummmer, etterlevelseDokumentasjon.getTitle());
                        if (etterlevelseDokumentasjonKortTittel.length() > 50) {
                            etterlevelseDokumentasjonKortTittel = etterlevelseDokumentasjonKortTittel.substring(0, 47) + "...";
                        }

                        varselService.varsle(etterlevelseDokumentasjon.getVarslingsadresser(), Varsel.builder()
                                .title("Etterlevelsesdokumentasjonen er ikke endret på 6 måneder %s".formatted(etterlevelseNummmer))
                                .paragraph(new Varsel.Paragraph("Dere bør vurdere om det har skjedd endringer som krever oppdatering av dokumentasjonen for %s.",
                                        url(urlGenerator.etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon.getId().toString()), etterlevelseDokumentasjonKortTittel)))
                                .build(), String.valueOf(etterlevelseDokumentasjon.getId()));
                    }
        });
    }

    private boolean isMultipleOf6Months(YearMonth now, LocalDateTime lastModifiedDate) {
        long monthsBetween = ChronoUnit.MONTHS.between(YearMonth.from(lastModifiedDate), now);
        return monthsBetween >= 6 && monthsBetween % 6 == 0;
    }

}
