package no.nav.data.pvk.behandlingensArtOgOmfang;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.AuditVersionService;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.UnauthorizedException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.jpa.OptimisticLockUtil;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.utils.UtcDateTimeUtil;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfang;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfangRepo;
import no.nav.data.pvk.behandlingensArtOgOmfang.dto.BehandlingensArtOgOmfangRequest;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class BehandlingensArtOgOmfangService {

    private final BehandlingensArtOgOmfangRepo repo;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService; // Denne må injiseres @Lazy for å bryte sirkulær avhengighet.
    private final AuditVersionService auditVersionService;

    public BehandlingensArtOgOmfangService(
            BehandlingensArtOgOmfangRepo repo,
            @Lazy EtterlevelseDokumentasjonService etterlevelseDokumentasjonService,
            AuditVersionService auditVersionService
    ) {
        this.repo = repo;
        this.etterlevelseDokumentasjonService = etterlevelseDokumentasjonService;
        this.auditVersionService = auditVersionService;
    }

    public BehandlingensArtOgOmfang get(UUID uuid) {
        return repo.findById(uuid).orElse(null);
    }

    public Page<BehandlingensArtOgOmfang> getAll(PageParameters pageParameters) {
        return repo.findAll(pageParameters.createPage());
    }

    public Optional<BehandlingensArtOgOmfang> getByEtterlevelseDokumentasjonId(UUID etterlevelseDokumentasjonId) {
        return repo.findByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public BehandlingensArtOgOmfang save(BehandlingensArtOgOmfangRequest request) {
        BehandlingensArtOgOmfang behandlingensArtOgOmfang = request.isUpdate() ? get(request.getId()) : new BehandlingensArtOgOmfang();
        var edok = etterlevelseDokumentasjonService.get(request.getEtterlevelseDokumentasjonId());
        if (!etterlevelseDokumentasjonService.hasUserWriteAccess(edok)) { // Merk: NPE hvis edok == null
            throw new UnauthorizedException(String.format("User has no write access for this dokument %s", request.getId()));
        }
        if (request.isUpdate()) {
            if (behandlingensArtOgOmfang== null) {
                throw new NotFoundException(String.format("Could not find Behandlingens art og omfang to be updated with id = %s ", request.getId()));
            }
            OptimisticLockUtil.checkVersion(BehandlingensArtOgOmfang.class, request.getId(), behandlingensArtOgOmfang.getVersion(), request.getVersion());
        } else {
            var existingBehandlingensArtOgOmfang = getByEtterlevelseDokumentasjonId(behandlingensArtOgOmfang.getEtterlevelseDokumentasjonId());
            if (existingBehandlingensArtOgOmfang.isPresent()) {
                throw new ValidationException("Found existing behandlingens art og omfang when trying to create for etterlevelse dokumentation id: " + behandlingensArtOgOmfang.getEtterlevelseDokumentasjonId());
            }
        }

        request.mergeInto(behandlingensArtOgOmfang);
        return repo.save(behandlingensArtOgOmfang);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public BehandlingensArtOgOmfang delete(UUID id) {
        return delete(id, null);
    }

    /**
     * @param version versjonen klienten sist leste. Sjekkes hvis oppgitt.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public BehandlingensArtOgOmfang delete(UUID id, Integer version) {
        BehandlingensArtOgOmfang behandlingensArtOgOmfangtoDelete = repo.findById(id).orElse(null);
        if (behandlingensArtOgOmfangtoDelete != null) {
            OptimisticLockUtil.checkVersionIfPresent(BehandlingensArtOgOmfang.class, id, behandlingensArtOgOmfangtoDelete.getVersion(), version);
        }
        repo.deleteById(id);
        return behandlingensArtOgOmfangtoDelete;
    }


    public BehandlingensArtOgOmfang getArtOgOmfangByEtterlevelseDokumentasjonIdAndTimestamp(String etterlevelseDokumentasjonId, LocalDateTime timestamp) {
        List<AuditVersion> auditArtOgOmfang = auditVersionService.findByTableNameAndFieldNameAndFieldValueAndTimestamp(BehandlingensArtOgOmfang.TABLENAME,"etterlevelseDokumentasjonId", etterlevelseDokumentasjonId, UtcDateTimeUtil.roundUpToSecond(timestamp));
        if (!auditArtOgOmfang.isEmpty()) {
            return auditArtOgOmfang.getFirst().getObjectDataByDomain(BehandlingensArtOgOmfang.class);
        }
        return null;
    }
}
