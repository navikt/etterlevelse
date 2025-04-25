package no.nav.data.etterlevelse.krav;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding.Melding;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingRepo;
import no.nav.data.etterlevelse.krav.domain.TilbakemeldingStatus;
import no.nav.data.etterlevelse.krav.dto.CreateTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingNewMeldingRequest;
import no.nav.data.etterlevelse.varsel.UrlGenerator;
import no.nav.data.etterlevelse.varsel.VarselService;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.etterlevelse.varsel.domain.Varsel.Paragraph;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;
import static no.nav.data.etterlevelse.varsel.domain.Varsel.Paragraph.VarselUrl.url;

@Slf4j
@Service
@RequiredArgsConstructor
public class TilbakemeldingService extends DomainService<Tilbakemelding> {

    private final TeamcatResourceClient resourceClient;
    private final UrlGenerator urlGenerator;
    private final VarselService varselService;
    private final TilbakemeldingRepo tilbakemeldingRepo;


    public List<Tilbakemelding> getForKravByNumberAndVersion(int kravNummer, int kravVersjon) {
        return convertToDomaionObject(tilbakemeldingRepo.findByKravNummerAndVersion(kravNummer, kravVersjon));
    }

    public List<Tilbakemelding> getForKravByNumber(int kravNummer) {
        return convertToDomaionObject(tilbakemeldingRepo.findByKravNummer(kravNummer));
    }

    @Transactional
    public Tilbakemelding create(CreateTilbakemeldingRequest request) {
        var tilbakemelding = Tilbakemelding.create(request);
        var melding = tilbakemelding.getLastMelding();

        tilbakemelding = storage.save(tilbakemelding);
        varsle(tilbakemelding, melding,false);

        log.info("New tilbakemelding {} på {} fra {}", tilbakemelding.getId(), tilbakemelding.kravId(), tilbakemelding.getMelder().getIdent());
        return storage.save(tilbakemelding);
    }

    @Transactional
    public Tilbakemelding newMelding(TilbakemeldingNewMeldingRequest request) {
        request.validate();

        var tilbakemelding = get(request.getTilbakemeldingId());
        var melding = tilbakemelding.newMelding(request);
        varsle(tilbakemelding, melding, false);
        tilbakemelding.setStatus(request.getStatus());
        tilbakemelding.setEndretKrav(request.isEndretKrav());
        log.info("New melding nr {} på tilbakemelding {} på {} fra {}",
                melding.getMeldingNr(), tilbakemelding.getId(), tilbakemelding.kravId(), tilbakemelding.getMelder().getIdent());
        return storage.save(tilbakemelding);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Tilbakemelding deleteMelding(UUID tilbakemeldingId, int meldingNr) {
        var tilbakemelding = get(tilbakemeldingId);
        var melding = tilbakemelding.finnMelding(meldingNr);
        SecurityUtils.assertIsUserOrAdmin(melding.getFraIdent(), "Ikke din melding");
        if (meldingNr == 1) {
            return storage.delete(tilbakemelding);
        }
        tilbakemelding.fjernMelding(melding);
        return storage.save(tilbakemelding);
    }

    @Transactional
    public Tilbakemelding editMelding(UUID tilbakemeldingId, int meldingNr, String body) {
        var tilbakemelding = get(tilbakemeldingId);
        var melding = tilbakemelding.finnMelding(meldingNr);
        SecurityUtils.assertIsUserOrAdmin(melding.getFraIdent(), "Ikke din melding");
        melding.endre(body);
        varsle(tilbakemelding, melding, true);
        return storage.save(tilbakemelding);
    }

    @Transactional
    public Tilbakemelding updateTilbakemeldingStatusAndEndretKrav(UUID tilbakemeldingId, TilbakemeldingStatus tilbakemeldingStatus, boolean endretKrav){
        var tilbakemelding = get(tilbakemeldingId);
        tilbakemelding.setStatus(tilbakemeldingStatus);
        tilbakemelding.setEndretKrav(endretKrav);
        return storage.save(tilbakemelding);
    }

    public Page<Tilbakemelding> getAll(Pageable pageable) {
        return storage.getAll(Tilbakemelding.class, pageable);
    }

    private void varsle(Tilbakemelding tilbakemelding, Melding melding, boolean isEdit) {
        Krav krav = kravRepo.findByKravNummerAndKravVersjon(tilbakemelding.getKravNummer(), tilbakemelding.getKravVersjon()).orElseThrow();
        var sender = resourceClient.getResource(melding.getFraIdent()).orElseThrow();
        var recipients = tilbakemelding.getRecipientsForMelding(krav, melding);

        String kravId = krav.kravId();

        var varselBuilder = Varsel.builder();

        if (isEdit) {
            varselBuilder.title("Melding endret på krav %s".formatted(kravId));
        } else if (melding.getMeldingNr() == 1) {
            varselBuilder.title("Ny tilbakemelding på krav %s".formatted(kravId));
        }  else {
            varselBuilder.title("Melding endret på krav %s".formatted(kravId));
        }

        varselBuilder.paragraph(new Paragraph("%s har lagt igjen en tilbakemelding på Krav %%s"
                .formatted(sender.getFullName()), url(urlGenerator.tilbakemeldingUrl(tilbakemelding), kravId)));
        
        varselService.varsle(recipients, varselBuilder.build());
    }

}
