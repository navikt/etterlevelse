package no.nav.data.etterlevelse.etterlevelse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest.Fields;
import no.nav.data.etterlevelse.etterlevelse.dto.SuksesskriterieBegrunnelseRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.groupBy;


@Service
@Slf4j
@RequiredArgsConstructor
public class EtterlevelseService {

    private final EtterlevelseRepo repo;
    private final KravRepo kravRepo;

    public Etterlevelse get(UUID uuid) {
        if (uuid == null || !exists(uuid)) return null; 
        return repo.findById(uuid).get();
    }
    
    public boolean exists(UUID uuid) {
        return repo.existsById(uuid);
    }

    @Transactional
    public Etterlevelse save(Etterlevelse etterlevelse) {
        etterlevelse = repo.save(etterlevelse);
        repo.flush();
        return etterlevelse;
    }
    
    Page<Etterlevelse> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage());
    }

    public List<Etterlevelse> getByKravNummer(int kravNummer) {
        return repo.findByKravNummer(kravNummer);
    }

    public List<Etterlevelse> getByKravNummer(int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByKravNummer(kravNummer);
        }
        return repo.findByKravNummer(kravNummer, kravVersjon);
    }

    public List<Etterlevelse> getByEtterlevelseDokumentasjon(UUID etterlevelseDokumentasjonId) {
        return repo.findByEtterlevelseDokumensjon(etterlevelseDokumentasjonId);
    }

    public List<Etterlevelse> getByEtterlevelseDokumentasjonIdAndKravNummer(UUID etterlevelseDokumentasjonId, int kravNummer) {
        return repo.findByEtterlevelseDokumentasjonIdAndKravNummer(etterlevelseDokumentasjonId, kravNummer);
    }

    public Optional<Etterlevelse> getByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(UUID etterlevelseDokumentasjonId, int kravNummer, int kravVersjon) {
        return repo.findByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(etterlevelseDokumentasjonId, kravNummer, kravVersjon);
    }

    public Map<UUID, List<Etterlevelse>> getByEtterlevelseDokumentasjoner(Collection<UUID> etterlevelseDokumentasjonIds) {
        return groupBy(repo.findByEtterlevelseDokumentasjoner(new ArrayList<>(etterlevelseDokumentasjonIds)), Etterlevelse::getEtterlevelseDokumentasjonId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Etterlevelse save(EtterlevelseRequest request) {
        Validator.validate(request)
                .addValidations(this::validateKrav)
                .ifErrorsThrowValidationException();

        var etterlevelse = request.isUpdate() ? get(request.getId()) : new Etterlevelse();

        if (!request.isUpdate()) {
            var existingEtterlevelse = repo.findByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(request.getEtterlevelseDokumentasjonId(), request.getKravNummer(), request.getKravVersjon());
            if (existingEtterlevelse.isPresent()) {
                log.warn("Found existing etterlevelse when trying to create for etterlevelse dokumentation id: {}, for krav: K{}.{}", request.getEtterlevelseDokumentasjonId(), request.getKravNummer(), request.getKravVersjon());
                etterlevelse = existingEtterlevelse.get();
            }
        }

        request.mergeInto(etterlevelse);

        return repo.save(etterlevelse);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void copyEtterlevelse(UUID fromDocumentId, UUID toDocumentId) {
        var etterlevelseToCopy = getByEtterlevelseDokumentasjon(fromDocumentId);
        etterlevelseToCopy.forEach(etterlevelse -> {
            var krav = kravRepo.findByKravNummerAndKravVersjon(etterlevelse.getKravNummer(), etterlevelse.getKravVersjon()).orElse(new Krav());
            if (krav.getStatus() == KravStatus.AKTIV) {
                List<SuksesskriterieBegrunnelseRequest> suksesskriterieBegrunnelseRequestList = etterlevelse.getSuksesskriterieBegrunnelser().stream().map((skb) -> SuksesskriterieBegrunnelseRequest.builder()
                        .suksesskriterieId(skb.getSuksesskriterieId())
                        .begrunnelse(skb.getBegrunnelse())
                        .suksesskriterieStatus(skb.getSuksesskriterieStatus())
                        .veiledning(false)
                        .veiledningsTekst("")
                        .build()).toList();
                var newEtterlevelse = new Etterlevelse();
                EtterlevelseRequest.builder()
                    .update(false)
                    .etterlevelseDokumentasjonId(toDocumentId)
                    .kravNummer(etterlevelse.getKravNummer())
                    .kravVersjon(etterlevelse.getKravVersjon())
                    .etterleves(etterlevelse.isEtterleves())
                    .statusBegrunnelse(etterlevelse.getStatusBegrunnelse())
                    .dokumentasjon(etterlevelse.getDokumentasjon())
                    .fristForFerdigstillelse(etterlevelse.getFristForFerdigstillelse())
                    .status(etterlevelse.getStatus())
                    .suksesskriterieBegrunnelser(suksesskriterieBegrunnelseRequestList)
                    .build()
                    .mergeInto(newEtterlevelse);
                repo.save(newEtterlevelse);
            }
        });
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteByEtterlevelseDokumentasjonId(UUID etterlevelseDokumentasjonId) {
        List<Etterlevelse> etterlevelser = repo.findByEtterlevelseDokumensjon(etterlevelseDokumentasjonId);
        etterlevelser.forEach(e -> log.info("deleting etterlevelse with id={}, connected to etterlevelse dokumentasjon with id={}", e.getId(), etterlevelseDokumentasjonId));
        repo.deleteAll(etterlevelser);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Etterlevelse delete(UUID id) {
        var etterlevelseToDelete = repo.findById(id);
        repo.deleteById(id);
        return etterlevelseToDelete.orElse(null);
    }

    public Page<Etterlevelse> getAllEtterlevelseStatistics(Pageable page) {
        return repo.findAll(page);
    }

    // TODO: Validering må flyttes ut til en egen komponent og kalles av Controller eksplisitt. Se lignende kommentar i DomainService.
    private void validateKrav(Validator<EtterlevelseRequest> validator) {
        // Check if (kravNummer, kravVersjon) point to existing krav...
        Integer kravNummer = validator.getItem().getKravNummer();
        Integer kravVersjon = validator.getItem().getKravVersjon();
        if (kravNummer == null || kravVersjon == null) {
            return;
        }
        Optional<Krav> krav = kravRepo.findByKravNummerAndKravVersjon(kravNummer, kravVersjon);
        if (krav.isEmpty()) {
            validator.addError(Fields.kravNummer, Validator.DOES_NOT_EXIST, "KravNummer %d KravVersjon %d does not exist".formatted(kravNummer, kravVersjon));
            return;
        }
        // Check if valid status...
        if (!validator.getItem().isUpdate() && !krav.get().getStatus().kanEtterleves()) {
                validator.addError(Fields.kravNummer, "FEIL_KRAVSTATUS", "Krav %s kan ikke ettereleves med status %s".formatted(
                        krav.get().kravId(), krav.get().getStatus()
                ));
        }
    }
    
}
