package no.nav.data.etterlevelse.etterlevelsemetadata;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.PageParameters;
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
        request.mergeInto(etterlevelseMetadata);

        return repo.save(etterlevelseMetadata);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteByEtterlevelseDokumentasjonId(UUID etterlevelseDokumentasjonId){
        List<EtterlevelseMetadata> etterlevelseMetadataer = repo.findByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
        etterlevelseMetadataer.forEach(em -> log.info("deleting etterlevelse metadata with id={}, connected to etterlevelse dokumentasjon with id={}", em.getId(), etterlevelseDokumentasjonId));
        repo.deleteAll(etterlevelseMetadataer);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public EtterlevelseMetadata delete(UUID id) {
        var ettMetDelete = get(id);
        repo.deleteById(id);
        return ettMetDelete;
    }
}
