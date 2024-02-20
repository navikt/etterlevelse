package no.nav.data.etterlevelse.etterlevelsemetadata;

import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadataRepo;
import no.nav.data.etterlevelse.etterlevelsemetadata.dto.EtterlevelseMetadataRequest;
import org.springframework.data.domain.Page;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.storage.domain.GenericStorage.convertToDomaionObject;

@Service
public class EtterlevelseMetadataService extends DomainService<EtterlevelseMetadata> {

    private final EtterlevelseMetadataRepo repo;

    public EtterlevelseMetadataService(EtterlevelseMetadataRepo repo) {
        this.repo = repo;
    }

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

    public EtterlevelseMetadata save(EtterlevelseMetadataRequest request) {

        var etterlevelseMetadata = request.isUpdate() ? storage.get(request.getIdAsUUID()) : new EtterlevelseMetadata();
        etterlevelseMetadata.convert(request);

        return storage.save(etterlevelseMetadata);
    }

    public List<EtterlevelseMetadata> deleteByEtterlevelseDokumentasjonId(String etterlevelseDokumentasjonId){
        return convertToDomaionObject(etterlevelseMetadataRepo.deleteByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId));
    }

    public EtterlevelseMetadata delete(UUID id) {
        return storage.delete(id);
    }
}
