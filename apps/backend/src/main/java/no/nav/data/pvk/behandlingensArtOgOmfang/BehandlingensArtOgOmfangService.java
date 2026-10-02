package no.nav.data.pvk.behandlingensArtOgOmfang;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.AuditVersionService;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.utils.UtcDateTimeUtil;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfang;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfangRepo;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentStatus;
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
@RequiredArgsConstructor
public class BehandlingensArtOgOmfangService {

    private final BehandlingensArtOgOmfangRepo repo;
    private final AuditVersionService auditVersionService;

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
    public BehandlingensArtOgOmfang save(BehandlingensArtOgOmfang behandlingensArtOgOmfang, boolean isUpdate) {
        if (!isUpdate) {
            var existingBehandlingensArtOgOmfang = getByEtterlevelseDokumentasjonId(behandlingensArtOgOmfang.getEtterlevelseDokumentasjonId());
            if (existingBehandlingensArtOgOmfang.isPresent()) {
                log.warn("Found existing behandlingens art og omfang when trying to create for etterlevelse dokumentation id: {}", behandlingensArtOgOmfang.getEtterlevelseDokumentasjonId());
                behandlingensArtOgOmfang.setId(existingBehandlingensArtOgOmfang.get().getId());
            } else {
                behandlingensArtOgOmfang.setId(UUID.randomUUID());
            }
        }

        return repo.save(behandlingensArtOgOmfang);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public BehandlingensArtOgOmfang delete(UUID id) {
        BehandlingensArtOgOmfang behandlingensArtOgOmfangtoDelete = repo.findById(id).orElse(null);
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
