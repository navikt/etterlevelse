package no.nav.data.etterlevelse.etterlevelse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest.Fields;
import no.nav.data.etterlevelse.etterlevelse.dto.SuksesskriterieBegrunnelseRequest;
import no.nav.data.etterlevelse.krav.domain.Krav;
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

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;
import static no.nav.data.common.utils.StreamUtils.groupBy;


@Service
@Slf4j
@RequiredArgsConstructor
public class EtterlevelseService extends DomainService<Etterlevelse> {

    private final EtterlevelseRepo repo;

    Page<Etterlevelse> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public List<Etterlevelse> getByKravNummer(int kravNummer) {
        return convertToDomaionObject(repo.findByKravNummer(kravNummer));
    }

    public List<Etterlevelse> getByKravNummer(int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByKravNummer(kravNummer);
        }
        return convertToDomaionObject(repo.findByKravNummer(kravNummer, kravVersjon));
    }

    public List<Etterlevelse> getByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
        return convertToDomaionObject(repo.findByEtterlevelseDokumensjon(etterlevelseDokumentasjonId));
    }

    public List<Etterlevelse> getByEtterlevelseDokumentasjonIdAndKravNummer(String etterlevelseDokumentasjonId, int kravNummer) {
        return convertToDomaionObject(repo.findByEtterlevelseDokumentasjonIdAndKravNummer(etterlevelseDokumentasjonId, kravNummer));
    }

    public Optional<Etterlevelse> getByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(String etterlevelseDokumentasjonId, int kravNummer, int kravVersjon) {
        return repo.findByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(etterlevelseDokumentasjonId, kravNummer, kravVersjon).map(GenericStorage::getDomainObjectData);
    }

    public Map<String, List<Etterlevelse>> getByEtterlevelseDokumentasjoner(Collection<String> etterlevelseDokumentasjonIds) {
        return groupBy(convertToDomaionObject(repo.findByEtterlevelseDokumentasjoner(new ArrayList<>(etterlevelseDokumentasjonIds))), Etterlevelse::getEtterlevelseDokumentasjonId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public Etterlevelse save(EtterlevelseRequest request) {
        Validator.validate(request, storage::get)
                .addValidations(this::validateKrav)
                .ifErrorsThrowValidationException();

        var etterlevelse = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new Etterlevelse();

        if (!request.isUpdate()) {
            var existingEtterlevelse = repo.findByEtterlevelseDokumentasjonIdAndKravNummerAndKravVersjon(request.getEtterlevelseDokumentasjonId(), request.getKravNummer(), request.getKravVersjon());
            if (existingEtterlevelse.isPresent()) {
                log.warn("Found existing etterlevelse whne trying to create for etterlevelse dokumentation id: {}, for krav: K{}.{}", request.getEtterlevelseDokumentasjonId(), request.getKravNummer(), request.getKravVersjon());
                etterlevelse = existingEtterlevelse.get().getDomainObjectData();
            }
        }

        etterlevelse.merge(request);

        return storage.save(etterlevelse);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void copyEtterlevelse(String fromDocumentId, String toDocumentId) {
        var etterlevelseToCopy = getByEtterlevelseDokumentasjon(fromDocumentId);
        etterlevelseToCopy.forEach(etterlevelse -> {

            var krav = etterlevelseRepo.findKravForEtterlevelse(etterlevelse.getKravNummer(), etterlevelse.getKravVersjon()).map(GenericStorage::getDomainObjectData).orElse(new Krav());

            if (krav.getStatus() == KravStatus.AKTIV) {

            List<SuksesskriterieBegrunnelseRequest> suksesskriterieBegrunnelseRequestList = etterlevelse.getSuksesskriterieBegrunnelser().stream().map((skb) -> SuksesskriterieBegrunnelseRequest.builder()
                    .suksesskriterieId(skb.getSuksesskriterieId())
                    .begrunnelse(skb.getBegrunnelse())
                    .suksesskriterieStatus(skb.getSuksesskriterieStatus())
                    .veiledning(false)
                    .veiledningsTekst("")
                    .build()).toList();

            var newEtterlevelse = new Etterlevelse();
            newEtterlevelse.merge(
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
                            .build());

            storage.save(newEtterlevelse);

            }

        });
    }


    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteByEtterlevelseDokumentasjonId(String etterlevelseDokumentasjonId) {
        List<Etterlevelse> etterlevelser = convertToDomaionObject(etterlevelseRepo.findByEtterlevelseDokumensjon(etterlevelseDokumentasjonId));
        etterlevelser.forEach(e -> log.info("deleting etterlevelse with id={}, connected to etterlevelse dokumentasjon with id={}", e.getId(), etterlevelseDokumentasjonId));
        storage.deleteAll(etterlevelser);
    }


    @Transactional(propagation = Propagation.REQUIRED)
    public Etterlevelse delete(UUID id) {
        return storage.delete(id);
    }

    public Page<Etterlevelse> getAllEtterlevelseStatistics(Pageable page) {
        Page<GenericStorage<Etterlevelse>> all = etterlevelseRepo.findAll(page);
        return all.map(GenericStorage::getDomainObjectData);
    }

    private void validateKrav(Validator<EtterlevelseRequest> validator) {
        validateKravNummer(validator).ifPresent(krav -> {
            if (!validator.getItem().isUpdate() && !krav.getStatus().kanEtterleves()) {
                validator.addError(Fields.kravNummer, "FEIL_KRAVSTATUS", "Krav %s kan ikke ettereleves med status %s".formatted(
                        krav.kravId(), krav.getStatus()
                ));
            }
        });
    }

}
