package no.nav.data.pvk.pvkdokument;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.AuditVersionService;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.utils.UtcDateTimeUtil;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.varsel.UrlGenerator;
import no.nav.data.etterlevelse.varsel.VarselService;
import no.nav.data.etterlevelse.varsel.domain.AdresseType;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
import no.nav.data.pvk.pvotilbakemelding.PvoTilbakemeldingService;
import no.nav.data.pvk.risikoscenario.RisikoscenarioService;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioType;
import no.nav.data.pvk.tiltak.TiltakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.etterlevelse.varsel.domain.Varsel.Paragraph.VarselUrl.url;

@Service
@Slf4j
@RequiredArgsConstructor
public class PvkDokumentService {

    private final PvkDokumentRepo pvkDokumentRepo;
    private final RisikoscenarioService risikoscenarioService;
    private final TiltakService tiltakService;
    private final PvoTilbakemeldingService pvoTilbakemeldingService;
    private final AuditVersionService auditVersionService;

    @Lazy
    @Autowired
    private EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final VarselService varselService;
    private final UrlGenerator urlGenerator;

    @Value("${client.pvo.address}")
    private String pvoEmail;

    public PvkDokument get(UUID uuid) {
        return pvkDokumentRepo.findById(uuid).orElse(null);
    }

    public Page<PvkDokument> getAll(PageParameters pageParameters) {
        return pvkDokumentRepo.findAll(pageParameters.createPage());
    }

    public Optional<PvkDokument> getByEtterlevelseDokumentasjon(UUID etterlevelseDokumentasjonId) {
        return pvkDokumentRepo.findByEtterlevelseDokumensjon(etterlevelseDokumentasjonId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument save(PvkDokument pvkDokument, boolean isUpdate) {
        var existingPvkDokument = getByEtterlevelseDokumentasjon(pvkDokument.getEtterlevelseDokumentId());

        if (!isUpdate) {
            if (existingPvkDokument.isPresent()) {
                log.warn("Found existing pvk document when trying to create for etterlevelse dokumentation id: {}", pvkDokument.getEtterlevelseDokumentId());
                pvkDokument.setId(existingPvkDokument.get().getId());
            } else {
                pvkDokument.setId(UUID.randomUUID());
            }
        }

        if (pvkDokument.getStatus().equals(PvkDokumentStatus.SENDT_TIL_PVO) || pvkDokument.getStatus().equals(PvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)) {
            sendVarselToPvo(pvkDokument);
        }
        //viktig at vi sjekker at eksisterende pvk dokument har status sendt til pvo eller sendt til pvo for revurdering,
        // ellers vil vi sende varsel hver gang vi oppdaterer pvk dokumentet etter vurdering fra pvo
        // eller når vi oppretter ny versjon av etterlevelsesdokumentasjon
        else if (
                existingPvkDokument.isPresent() &&
                (existingPvkDokument.get().getStatus().equals(PvkDokumentStatus.SENDT_TIL_PVO) || existingPvkDokument.get().getStatus().equals(PvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
                || existingPvkDokument.get().getStatus().equals(PvkDokumentStatus.PVO_UNDERARBEID)
                )  &&
                        (pvkDokument.getStatus().equals(PvkDokumentStatus.VURDERT_AV_PVO) || pvkDokument.getStatus().equals(PvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID))) {
            sendPvoVarselToEtterlever(pvkDokument);
        } else if (pvkDokument.getStatus().equals(PvkDokumentStatus.TRENGER_GODKJENNING)) {
            sendVarselToRisikoeier(pvkDokument);
        } else if (pvkDokument.getStatus().equals(PvkDokumentStatus.GODKJENT_AV_RISIKOEIER)) {
            sendVarselToEtterlever(pvkDokument);
        }

        return pvkDokumentRepo.save(pvkDokument);
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public boolean isDeleteable(UUID id) {
        PvkDokument pvkDokument = pvkDokumentRepo.findById(id).orElse(null);
        return pvkDokument != null
                && risikoscenarioService.getByPvkDokument(id.toString(), RisikoscenarioType.ALL).isEmpty()
                && tiltakService.getByPvkDokument(id).isEmpty();
    }
    
    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument delete(UUID id) {
        if (!isDeleteable(id)) {
            return null;
        }
        PvkDokument pvkDokumentToDelete = pvkDokumentRepo.findById(id).orElse(null);
        pvkDokumentRepo.deleteById(id);
        return pvkDokumentToDelete;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public PvkDokument deletePvkAndAllChildren(UUID id) {

        log.info("deleting tiltak connected to pvk dokument with id={}", id);
        tiltakService.deleteByPvkDokumentId(id);

        log.info("deleting risikoscenario connected to pvk dokument with id={}", id);
        risikoscenarioService.deleteByPvkDokumentId(id);

        log.info("deleting pvo tilbakemelding connected to pvk dokument with id={}", id);
        pvoTilbakemeldingService.deleteByPvkDokumentId(id);

        return delete(id);
    }

    private void sendVarselToPvo(PvkDokument pvkDokument) {
        var etterlevelseDokumentasjon =  etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId());
        List<Varslingsadresse> pvoVarslingsadresser = List.of(Varslingsadresse.builder()
                .adresse(pvoEmail)
                .type(AdresseType.EPOST)
                .build());

        String etterlevelseDokumentasjonNummer = "E%s.%s".formatted(etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseDokumentasjon.getEtterlevelseDokumentVersjon());
        String etterlevelseDokumentasjonKortTittel = "%s %s".formatted(etterlevelseDokumentasjonNummer, etterlevelseDokumentasjon.getTitle());
        if (etterlevelseDokumentasjonKortTittel.length() > 50) {
            etterlevelseDokumentasjonKortTittel = etterlevelseDokumentasjonKortTittel.substring(0, 47) + "...";
        }

        varselService.varsle(pvoVarslingsadresser, Varsel.builder()
                .title("Innsending av Digital PVK til PVO for %s".formatted(etterlevelseDokumentasjonNummer))
                .paragraph(
                        new Varsel.Paragraph("Digital PVK for %s, er sendt til PVO for vurdering.",
                                url(urlGenerator.etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon.getId().toString()),etterlevelseDokumentasjonKortTittel)))
                .build(), etterlevelseDokumentasjon.getId().toString());
    }

    private void sendPvoVarselToEtterlever(PvkDokument pvkDokument) {
        var etterlevelseDokumentasjon =  etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId());

        String etterlevelseDokumentasjonNummer = "E%s.%s".formatted(etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseDokumentasjon.getEtterlevelseDokumentVersjon());
        String etterlevelseDokumentasjonKortTittel = "%s %s".formatted(etterlevelseDokumentasjonNummer, etterlevelseDokumentasjon.getTitle());
        if (etterlevelseDokumentasjonKortTittel.length() > 50) {
            etterlevelseDokumentasjonKortTittel = etterlevelseDokumentasjonKortTittel.substring(0, 47) + "...";
        }

        varselService.varsle(etterlevelseDokumentasjon.getVarslingsadresser(), Varsel.builder()
                .title("Digital PVK for %s, er vurdert av PVO".formatted(etterlevelseDokumentasjonNummer))
                .paragraph(
                        new Varsel.Paragraph("Digital PVK for %s, er vurdert av PVO.",
                                url(urlGenerator.etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon.getId().toString()),etterlevelseDokumentasjonKortTittel)))
                .build(), etterlevelseDokumentasjon.getId().toString());
    }

    private void sendVarselToRisikoeier(PvkDokument pvkDokument) {
        var etterlevelseDokumentasjon =  etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId());

        List<Resource> risikoeiere = etterlevelseDokumentasjonService.getResourcesData(etterlevelseDokumentasjon.getEtterlevelseDokumentasjonData().getRisikoeiere());
        List<Varslingsadresse > varslingsadresser = new ArrayList<>();

        risikoeiere.forEach(risikoeier -> {
            varslingsadresser.add(Varslingsadresse.builder().adresse(risikoeier.getEmail()).type(AdresseType.EPOST).build());
        });

        String etterlevelseDokumentasjonNummer = "E%s.%s".formatted(etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseDokumentasjon.getEtterlevelseDokumentVersjon());
        String etterlevelseDokumentasjonKortTittel = "%s %s".formatted(etterlevelseDokumentasjonNummer, etterlevelseDokumentasjon.getTitle());
        if (etterlevelseDokumentasjonKortTittel.length() > 50) {
            etterlevelseDokumentasjonKortTittel = etterlevelseDokumentasjonKortTittel.substring(0, 47) + "...";
        }

        varselService.varsle(varslingsadresser, Varsel.builder()
                .title("Digital PVK for %s, er klar til godkjenning av risikoeier".formatted(etterlevelseDokumentasjonNummer))
                .paragraph(
                        new Varsel.Paragraph("Digital PVK for %s, er klar til godkjenning. Følg lenken og velg  “Godkjenn PVK” fra menyen på dokumentets temaside.",
                                url(urlGenerator.etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon.getId().toString()),etterlevelseDokumentasjonKortTittel)))
                .build(), etterlevelseDokumentasjon.getId().toString());
    }

    private void sendVarselToEtterlever(PvkDokument pvkDokument) {
        var etterlevelseDokumentasjon =  etterlevelseDokumentasjonService.get(pvkDokument.getEtterlevelseDokumentId());

        String etterlevelseDokumentasjonNummer = "E%s.%s".formatted(etterlevelseDokumentasjon.getEtterlevelseNummer(), etterlevelseDokumentasjon.getEtterlevelseDokumentVersjon());
        String etterlevelseDokumentasjonKortTittel = "%s %s".formatted(etterlevelseDokumentasjonNummer, etterlevelseDokumentasjon.getTitle());
        if (etterlevelseDokumentasjonKortTittel.length() > 50) {
            etterlevelseDokumentasjonKortTittel = etterlevelseDokumentasjonKortTittel.substring(0, 47) + "...";
        }

        varselService.varsle(etterlevelseDokumentasjon.getVarslingsadresser(), Varsel.builder()
                .title("Digital PVK for %s, er godkjent av risikoeier".formatted(etterlevelseDokumentasjonNummer))
                .paragraph(
                        new Varsel.Paragraph("Digital PVK for %s, er godkjent av risikoeier. Dokumentasjonen er nå låst fram til at dere velger å oppdatere den.",
                                url(urlGenerator.etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon.getId().toString()),etterlevelseDokumentasjonKortTittel)))
                .build(), etterlevelseDokumentasjon.getId().toString());
    }


    public PvkDokument getApprovedPvkDokumentByIdAndTimestamp(String pvkDokumentId, LocalDateTime timestamp) {
        List<AuditVersion> auditPvkDokument = auditVersionService.getByTableIdAndTimestamp(pvkDokumentId, UtcDateTimeUtil.roundUpToSecond(timestamp));
        if (!auditPvkDokument.isEmpty()) {
            var pvkDokument = auditPvkDokument.getFirst().getObjectDataByDomain(PvkDokument.class);

            //Fordi pvk dokument er låst når det opprettes ny versjon av etterlevelse dokumentasjon
            //så vet vi at sist redigert basert på datoen det opprettes ny versjon vil alltid gi siste godkjent pvk
            if(pvkDokument.getStatus().equals(PvkDokumentStatus.GODKJENT_AV_RISIKOEIER)) {
                log.info("Found approved pvk dokument with id = {} and timestamp = {}", pvkDokumentId, timestamp);
                return pvkDokument;
            } else {
                log.warn("Could not find approved pvk dokument with id = {} and timestamp = {}", pvkDokumentId, timestamp);
                return null;
            }
        }
        return null;
    }
}
