package no.nav.data.integration.ardoq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import no.nav.data.integration.ardoq.domain.ArdoqSystemRelationField;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ArdoqImportService {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final SecurityProperties securityProperties;


    @Transactional(propagation = Propagation.REQUIRED)
    public String syncArdoqData(List<ArdoqSystemRelationField> request) {
        log.info("Syncing ardoq system relations with etterlevelses document");

        if(securityProperties.isDev()) {
            log.info("Ignoring request to sync ardoq data in dev environment");
            return "Ignoring request to sync ardoq data in dev environment";
        } else {
            AtomicInteger count = new AtomicInteger(0);


            Map<String, List<String>> systemIdsByDokumentId = request.stream()
                    .collect(Collectors.groupingBy(ArdoqSystemRelationField::getEtterlevelseDokumentId,
                            Collectors.mapping(ArdoqSystemRelationField::getArdoqId, Collectors.toList())));
            log.info("Found {} ardoq system relations to sync with etterlevelses document", systemIdsByDokumentId.size());
            systemIdsByDokumentId.forEach((dokumentId, systemIds) -> {
                EtterlevelseDokumentasjon etterlevelseDokument = etterlevelseDokumentasjonService.get(UUID.fromString(dokumentId));
                if (etterlevelseDokument == null) {
                    log.warn("EtterlevelseDokumentasjon with id {} not found", dokumentId);
                    return;
                }
                List<String> ardoqSystemIds = etterlevelseDokument.getEtterlevelseDokumentasjonData().getArdoqSystemIds();
                List<String> newSystemIds = systemIds.stream()
                        .distinct()
                        .filter(systemId -> !ardoqSystemIds.contains(systemId))
                        .toList();
                if (!newSystemIds.isEmpty()) {
                    ardoqSystemIds.addAll(newSystemIds);
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
                    count.addAndGet(newSystemIds.size());
                }
            });
            log.info("Successfully synced {} ardoq system relations with etterlevelses document", count.get());
            return String.format("Successfully synced %s ardoq system relations with etterlevelses document", count.get());
        }
    }
}
