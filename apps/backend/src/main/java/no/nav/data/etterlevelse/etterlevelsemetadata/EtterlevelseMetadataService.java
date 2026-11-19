package no.nav.data.etterlevelse.etterlevelsemetadata;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.jpa.OptimisticLockUtil;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadataRepo;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EtterlevelseMetadataService {

    private final EtterlevelseMetadataRepo repo;

    public EtterlevelseMetadata get(UUID uuid) {
        return repo.findById(uuid).orElse(null);
    }
    
    public Page<EtterlevelseMetadata> getAll(PageParameters pageParameters){
        return repo.findAll(pageParameters.createPage());
    }

    public List<EtterlevelseMetadata> getByKravNummer(int kravNummer) {
        return repo.findByKravNummer(kravNummer);
    }

    public List<EtterlevelseMetadata> getByKravNummer(int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByKravNummer(kravNummer);
        }
        return repo.findByKravNummerAndKravVersjon(kravNummer, kravVersjon);
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjonId(UUID etterlevelseDokumentasjonId) {
        return repo.findByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjonIdAndKravNummer(UUID etterlevelseDokumentasjonId, int kravNummer) {
        return repo.findByEtterlevelseDokumentasjonIdAndKravNummer(etterlevelseDokumentasjonId, kravNummer);
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjonIdAndKrav(UUID etterlevelseDokumentasjonId, int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByEtterlevelseDokumentasjonIdAndKravNummer(etterlevelseDokumentasjonId, kravNummer);
        }
        return repo.findByEtterlevelseDokumentasjonIdAndKrav(etterlevelseDokumentasjonId, kravNummer, kravVersjon);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseMetadata save(EtterlevelseMetadataRequest request) {
        var etterlevelseMetadata = request.isUpdate() ? get(request.getId()) : new EtterlevelseMetadata();
        if (request.isUpdate()) {
            if (etterlevelseMetadata == null) {
                throw new NotFoundException("Couldn't find etterlevelse metadata with id " + request.getId());
            }
            OptimisticLockUtil.checkVersion(EtterlevelseMetadata.class, etterlevelseMetadata.getId(), etterlevelseMetadata.getVersion(), request.getVersion());
        }
        request.mergeInto(etterlevelseMetadata);

        return repo.saveAndFlush(etterlevelseMetadata);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteByEtterlevelseDokumentasjonId(UUID etterlevelseDokumentasjonId){
        List<EtterlevelseMetadata> etterlevelseMetadataer = repo.findByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
        etterlevelseMetadataer.forEach(em -> log.info("deleting etterlevelse metadata with id={}, connected to etterlevelse dokumentasjon with id={}", em.getId(), etterlevelseDokumentasjonId));
        repo.deleteAll(etterlevelseMetadataer);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseMetadata delete(UUID id) {
        return delete(id, null);
    }

    /**
     * @param version versjonen klienten sist leste. Sjekkes hvis oppgitt.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseMetadata delete(UUID id, Integer version) {
        var ettMetDelete = get(id);
        if (ettMetDelete != null) {
            OptimisticLockUtil.checkVersionIfPresent(EtterlevelseMetadata.class, id, ettMetDelete.getVersion(), version);
        }
        repo.deleteById(id);
        return ettMetDelete;
    }
}
