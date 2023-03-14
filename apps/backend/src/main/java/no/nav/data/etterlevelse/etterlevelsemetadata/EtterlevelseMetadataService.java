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

@Service
public class EtterlevelseMetadataService extends DomainService<EtterlevelseMetadata> {

    private final EtterlevelseMetadataRepo repo;

    public EtterlevelseMetadataService(EtterlevelseMetadataRepo repo) {
        super(EtterlevelseMetadata.class);
        this.repo = repo;
    }

    public Page<EtterlevelseMetadata> getAll(PageParameters pageParameters){
        return repo.findAll(pageParameters.createPage()).map(GenericStorage::toEtterlevelseMetadata);
    }

    public List<EtterlevelseMetadata> getByKravNummer(int kravNummer) {
        return GenericStorage.to(repo.findByKravNummer(kravNummer), EtterlevelseMetadata.class);
    }

    public List<EtterlevelseMetadata> getByKravNummer(int kravNummer, @Nullable Integer kravVersjon) {
        if (kravVersjon == null) {
            return getByKravNummer(kravNummer);
        }
        return GenericStorage.to(repo.findByKravNummerOgKravVersjon(kravNummer, kravVersjon), EtterlevelseMetadata.class);
    }

    public List<EtterlevelseMetadata> getByBehandling(String behandlingId) {
        return GenericStorage.to(repo.findByBehandling(behandlingId), EtterlevelseMetadata.class);
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjon(String etterlevelseDokumentasjonId) {
        return GenericStorage.to(repo.findByEtterlevelseDokumentasjon(etterlevelseDokumentasjonId), EtterlevelseMetadata.class);
    }

    public List<EtterlevelseMetadata> getByBehandlingAndKravNummer(String behandlingId, int kravNummer) {
        return GenericStorage.to(repo.findByBehandlingAndKravNummer(behandlingId, kravNummer), EtterlevelseMetadata.class);
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjonAndKravNummer(String etterlevelseDokumentasjonId, int kravNummer) {
        return GenericStorage.to(repo.findByEtterlevelseDokumentasjonAndKravNummer(etterlevelseDokumentasjonId, kravNummer), EtterlevelseMetadata.class);
    }

    public List<EtterlevelseMetadata> getByBehandlingAndKrav(String behandlingId, int kravNummer, @Nullable Integer kravVersjon) {
        if(kravVersjon == null) {
            return getByBehandlingAndKravNummer(behandlingId, kravNummer);
        }
        return GenericStorage.to(repo.findByBehandlingAndKrav(behandlingId, kravNummer, kravVersjon), EtterlevelseMetadata.class);
    }

    public List<EtterlevelseMetadata> getByEtterlevelseDokumentasjonAndKrav(String etterlevelseDokumentasjonId, int kravNummer, @Nullable Integer kravVersjon) {
        if(kravVersjon == null) {
            return getByEtterlevelseDokumentasjonAndKravNummer(etterlevelseDokumentasjonId, kravNummer);
        }
        return GenericStorage.to(repo.findByEtterlevelseDokumentasjonAndKrav(etterlevelseDokumentasjonId, kravNummer, kravVersjon), EtterlevelseMetadata.class);
    }

    public EtterlevelseMetadata save(EtterlevelseMetadataRequest request) {

        var etterlevelseMetadata = request.isUpdate() ? storage.get(request.getIdAsUUID(), EtterlevelseMetadata.class) : new EtterlevelseMetadata();
        etterlevelseMetadata.convert(request);

        return storage.save(etterlevelseMetadata);
    }

    public EtterlevelseMetadata delete(UUID id) {
        return storage.delete(id, EtterlevelseMetadata.class);
    }
}
