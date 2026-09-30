package no.nav.data.pvk.tiltak;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.varsel.UrlGenerator;
import no.nav.data.etterlevelse.varsel.VarselService;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakRepo;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

import static no.nav.data.etterlevelse.varsel.domain.Varsel.Paragraph.VarselUrl.url;

@Service
@Slf4j
@RequiredArgsConstructor
public class TiltakVarslingService {
    private final VarselService varselService;
    private final UrlGenerator urlGenerator;
    private final TiltakRepo repo;
    private final PvkDokumentRepo pkDokumentRepo;
    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;


    private List<Tiltak> getTiltakMedFristOm3Dager(LocalDate dateStamp) {
        return repo.findTiltakMedFristOm3Dager(dateStamp);
    }

    private List<Tiltak> getTiltakMedFristPassert1Dag(LocalDate dateStamp) {
        return repo.findTiltakMedFristPassert1Dag(dateStamp);
    }

    @SchedulerLock(name = "sendVarselForTiltak")
    @Scheduled(cron = "0 0 8 * * *")
    private void createVarselForTiltak() {
        LocalDate now = LocalDate.now();

        List<Tiltak> tiltakMedFristOm3Dager = getTiltakMedFristOm3Dager(now);
        List<Tiltak> tiltakMedFristPassert1Dag = getTiltakMedFristPassert1Dag(now);

        tiltakMedFristOm3Dager.forEach(tiltak -> {
            PvkDokument pvkDokument = pkDokumentRepo.getReferenceById(tiltak.getPvkDokumentId());
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.getReferenceById(pvkDokument.getEtterlevelseDokumentId());

            String etterlevelseNummmer = "E%s.%s".formatted(etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseDokumentasjon.getEtterlevelseDokumentVersjon());
            String etterlevelseDokumentasjonKortTittel = "%s %s".formatted(etterlevelseNummmer, etterlevelseDokumentasjon.getTitle());
            if (etterlevelseDokumentasjonKortTittel.length() > 50) {
                etterlevelseDokumentasjonKortTittel = etterlevelseDokumentasjonKortTittel.substring(0, 47) + "...";
            }

            varselService.varsle(etterlevelseDokumentasjon.getVarslingsadresser(), Varsel.builder()
                            .title("Tiltak nærmer seg tiltaksfrist %s".formatted(etterlevelseDokumentasjonKortTittel))
                    .paragraph(new Varsel.Paragraph("Digital PVK for %s inneholder tiltak som ikke er markert som iverksatt og som nærmer seg fastsatt tiltaksfrist.",
                            url(urlGenerator.pvkDokumentTiltakListUrl(etterlevelseDokumentasjon.getId().toString(), pvkDokument.getId().toString()),etterlevelseDokumentasjonKortTittel)))
                    .build(), String.valueOf(etterlevelseDokumentasjon.getId()));
        });

        tiltakMedFristPassert1Dag.forEach(tiltak -> {
            PvkDokument pvkDokument = pkDokumentRepo.getReferenceById(tiltak.getPvkDokumentId());
            EtterlevelseDokumentasjon etterlevelseDokumentasjon = etterlevelseDokumentasjonRepo.getReferenceById(pvkDokument.getEtterlevelseDokumentId());

            String etterlevelseNummmer = "E%s.%s".formatted(etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseDokumentasjon.getEtterlevelseDokumentVersjon());
            String etterlevelseDokumentasjonKortTittel = "%s %s".formatted(etterlevelseNummmer, etterlevelseDokumentasjon.getTitle());
            if (etterlevelseDokumentasjonKortTittel.length() > 50) {
                etterlevelseDokumentasjonKortTittel = etterlevelseDokumentasjonKortTittel.substring(0, 47) + "...";
            }

            varselService.varsle(etterlevelseDokumentasjon.getVarslingsadresser(), Varsel.builder()
                    .title("Tiltak er ikke gjennomført innen tiltaksfrist for %s".formatted(etterlevelseDokumentasjonKortTittel))
                    .paragraph(new Varsel.Paragraph("Digital PVK for %s inneholder tiltak som ikke er markert som iverksatt innen fastsatt tiltaksfrist.",
                            url(urlGenerator.pvkDokumentTiltakListUrl(etterlevelseDokumentasjon.getId().toString(), pvkDokument.getId().toString()),etterlevelseDokumentasjonKortTittel)))
                    .build(), String.valueOf(etterlevelseDokumentasjon.getId()));
        });
    }
}
