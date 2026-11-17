package no.nav.data.integration.ardoq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.integration.ardoq.domain.ArdoqSystemRelationField;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
@RequiredArgsConstructor
public class ArdoqImportService {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;


    @Transactional(propagation = Propagation.REQUIRED)
    public String syncArdoqData(List<ArdoqSystemRelationField> request) {
        log.info("Syncing ardoq system relations with etterlevelses document");

        AtomicInteger count = new AtomicInteger(0);

        request.forEach(ardoqSystemRelationField -> {
            EtterlevelseDokumentasjon etterlevelseDokument = etterlevelseDokumentasjonService.get(UUID.fromString(ardoqSystemRelationField.getEtterlevelseDokumentId()));
            List<String> ardoqSystemIds = etterlevelseDokument.getEtterlevelseDokumentasjonData().getArdoqSystemIds();
            if (!ardoqSystemIds.contains(ardoqSystemRelationField.getArdoqId())) {
                ardoqSystemIds.add(ardoqSystemRelationField.getArdoqId());
                EtterlevelseDokumentasjonRequest newRequest = EtterlevelseDokumentasjonRequest.builder()
                        .id(etterlevelseDokument.getId())
                        .update(true)
                        .etterlevelseNummer(etterlevelseDokument.getEtterlevelseNummer())
                        .title(etterlevelseDokument.getTitle())
                        .behandlingIds(etterlevelseDokument.getBehandlingIds())
                        .dpBehandlingIds(etterlevelseDokument.getEtterlevelseDokumentasjonData().getDpBehandlingIds())
                        .beskrivelse(etterlevelseDokument.getEtterlevelseDokumentasjonData().getBeskrivelse())
                        .gjenbrukBeskrivelse(etterlevelseDokument.getEtterlevelseDokumentasjonData().getGjenbrukBeskrivelse())
                        .tilgjengeligForGjenbruk(etterlevelseDokument.isTilgjengeligForGjenbruk())
                        .behandlerPersonopplysninger(etterlevelseDokument.getEtterlevelseDokumentasjonData().isBehandlerPersonopplysninger())
                        .status(etterlevelseDokument.getEtterlevelseDokumentasjonData().getStatus())
                        .meldingEtterlevelerTilRisikoeier(etterlevelseDokument.getEtterlevelseDokumentasjonData().getMeldingEtterlevelerTilRisikoeier())
                        .meldingRisikoeierTilEtterleveler(etterlevelseDokument.getEtterlevelseDokumentasjonData().getMeldingRisikoeierTilEtterleveler())
                        .irrelevansFor(etterlevelseDokument.getIrrelevansFor())
                        .prioritertKravNummer(etterlevelseDokument.getPrioritertKravNummer())
                        .risikovurderinger(etterlevelseDokument.getEtterlevelseDokumentasjonData().getRisikovurderinger())
                        .forGjenbruk(etterlevelseDokument.isForGjenbruk())
                        .teams(etterlevelseDokument.getTeams())
                        .resources(etterlevelseDokument.getResources())
                        .risikoeiere(etterlevelseDokument.getEtterlevelseDokumentasjonData().getRisikoeiere())
                        .P360Recno(etterlevelseDokument.getEtterlevelseDokumentasjonData().getP360Recno())
                        .P360CaseNumber(etterlevelseDokument.getEtterlevelseDokumentasjonData().getP360CaseNumber())
                        .ardoqSystemIds(ardoqSystemIds)
                        .nomOrganisering(etterlevelseDokument.getEtterlevelseDokumentasjonData().getNomOrganisering())
                        .varslingsadresser(etterlevelseDokument.getEtterlevelseDokumentasjonData().getVarslingsadresser())
                        .etterlevelseDokumentVersjon(etterlevelseDokument.getEtterlevelseDokumentasjonData().getEtterlevelseDokumentVersjon())
                        .versjonHistorikk(etterlevelseDokument.getEtterlevelseDokumentasjonData().getVersjonHistorikk())
                        .build();
                etterlevelseDokumentasjonService.save(newRequest);
                count.incrementAndGet();
            }
        });

        return String.format("Successfully synced %s ardoq system relations with etterlevelses document", count.get());
    }
}
