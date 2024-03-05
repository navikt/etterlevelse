package no.nav.data.etterlevelse.etterlevelsemetadata;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadataRepo;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import org.springframework.data.domain.Page;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;

@Service
@RequiredArgsConstructor
@Slf4j
public class EtterlevelseMetadataService extends DomainService<EtterlevelseMetadata> {

    private final EtterlevelseMetadataRepo repo;

    public Page<EtterlevelseMetadata> getAll(PageParameters pageParameters){
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::getDomainObjectData);
    }

    public List<EtterlevelseMetadata> getByKravNummer(int kravNummer) {
        return convertToDomaionObject(repo.findByKravNummer(kravNummer));
    }

    public List<EtterlevelseMetadata> getByKravNummer(int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByKravNummer(kravNummer);
        }
        return convertToDomaionObject(repo.findByKravNummerOgKravVersjon(kravNummer, kravVersjon));
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
        return convertToDomaionObject(repo.findByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId));
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjonAndKravNummer(String etterlevelseDokumentasjonId, int kravNummer) {
        return convertToDomaionObject(repo.findByEtterlevelseDokumentasjonAndKravNummer(etterlevelseDokumentasjonId, kravNummer));
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjonAndKrav(String etterlevelseDokumentasjonId, int kravNummer, @Nullable Integer kravVersjon) {
        if(kravVersjon == null) {
            return getByEtterlevelseDokumentasjonAndKravNummer(etterlevelseDokumentasjonId, kravNummer);
        }
        return convertToDomaionObject(repo.findByEtterlevelseDokumentasjonAndKrav(etterlevelseDokumentasjonId, kravNummer, kravVersjon));
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseMetadata save(EtterlevelseMetadataRequest request) {

        var etterlevelseMetadata = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new EtterlevelseMetadata();
        etterlevelseMetadata.merge(request);

        return storage.save(etterlevelseMetadata);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteByEtterlevelseDokumentasjonId(String etterlevelseDokumentasjonId){
        List<EtterlevelseMetadata> etterlevelseMetadataer = convertToDomaionObject(etterlevelseMetadataRepo.findByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId));
        etterlevelseMetadataer.forEach(em -> log.info("deleting etterlevelse metadata with id={}, connected to etterlevelse dokumentasjon with id={}", em.getId(), etterlevelseDokumentasjonId));
        storage.deleteAll(etterlevelseMetadataer);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseMetadata delete(UUID id) {
        return storage.delete(id);
    }
}
