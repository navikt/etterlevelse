package no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionCustomRepo;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslop;
import no.nav.data.etterlevelse.behandlingensLivslop.domain.BehandlingensLivslopRepo;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjonRepo;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore.dto.DeletedEtterlevelseDokumentasjonResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore.dto.RestoreResultResponse;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadataRepo;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfang;
import no.nav.data.pvk.behandlingensArtOgOmfang.domain.BehandlingensArtOgOmfangRepo;
import no.nav.data.pvk.pvkdokument.domain.PvkDokument;
import no.nav.data.pvk.pvkdokument.domain.PvkDokumentRepo;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemelding;
import no.nav.data.pvk.pvotilbakemelding.domain.PvoTilbakemeldingRepo;
import no.nav.data.pvk.risikoscenario.domain.Risikoscenario;
import no.nav.data.pvk.risikoscenario.domain.RisikoscenarioRepo;
import no.nav.data.pvk.tiltak.domain.Tiltak;
import no.nav.data.pvk.tiltak.domain.TiltakRepo;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestoreService {

    private static final String TABLE_ETTERLEVELSE_DOKUMENTASJON = "ETTERLEVELSE_DOKUMENTASJON";
    private static final String TABLE_ETTERLEVELSE = "ETTERLEVELSE";
    private static final String TABLE_ETTERLEVELSE_METADATA = "ETTERLEVELSE_METADATA";
    private static final String TABLE_BEHANDLINGENS_LIVSLOP = "BEHANDLINGENS_LIVSLOP";
    private static final String TABLE_BEHANDLINGENS_ART_OG_OMFANG = "BEHANDLINGENS_ART_OG_OMFANG";
    private static final String TABLE_PVK_DOKUMENT = "PVK_DOKUMENT";
    private static final String TABLE_RISIKOSCENARIO = "RISIKOSCENARIO";
    private static final String TABLE_TILTAK = "TILTAK";
    private static final String TABLE_PVO_TILBAKEMELDING = "PVO_TILBAKEMELDING";

    private static final String FK_ETTERLEVELSE_DOKUMENTASJON_ID = "etterlevelseDokumentasjonId";
    private static final String FK_ETTERLEVELSE_DOKUMENT_ID = "etterlevelseDokumentId";
    private static final String FK_PVK_DOKUMENT_ID = "pvkDokumentId";

    private final AuditVersionCustomRepo auditVersionCustomRepo;

    private final EtterlevelseDokumentasjonRepo etterlevelseDokumentasjonRepo;
    private final EtterlevelseRepo etterlevelseRepo;
    private final EtterlevelseMetadataRepo etterlevelseMetadataRepo;
    private final BehandlingensLivslopRepo behandlingensLivslopRepo;
    private final BehandlingensArtOgOmfangRepo behandlingensArtOgOmfangRepo;
    private final PvkDokumentRepo pvkDokumentRepo;
    private final RisikoscenarioRepo risikoscenarioRepo;
    private final TiltakRepo tiltakRepo;
    private final PvoTilbakemeldingRepo pvoTilbakemeldingRepo;

    public List<DeletedEtterlevelseDokumentasjonResponse> findDeleted() {
        List<AuditVersion> deleted = auditVersionCustomRepo.findLatestDeletedByTable(TABLE_ETTERLEVELSE_DOKUMENTASJON);
        List<DeletedEtterlevelseDokumentasjonResponse> result = new ArrayList<>();

        for (AuditVersion audit : deleted) {
            UUID id = UUID.fromString(audit.getTableId());
            if (etterlevelseDokumentasjonRepo.existsById(id)) {
                continue;
            }
            EtterlevelseDokumentasjon eDok = JsonUtils.toObject(audit.getData(), EtterlevelseDokumentasjon.class);
            boolean hadPvk = !auditVersionCustomRepo
                    .findLatestDeletedByTableAndFk(TABLE_PVK_DOKUMENT, FK_ETTERLEVELSE_DOKUMENT_ID, id.toString()).isEmpty();

            result.add(DeletedEtterlevelseDokumentasjonResponse.builder()
                    .id(id.toString())
                    .etterlevelseNummer(eDok.getEtterlevelseNummer())
                    .etterlevelseDokumentVersjon(eDok.getEtterlevelseDokumentVersjon())
                    .title(eDok.getTitle())
                    .deletedTime(audit.getTime())
                    .deletedBy(audit.getUser())
                    .hadPvk(hadPvk)
                    .build());
        }

        result.sort((a, b) -> b.getDeletedTime().compareTo(a.getDeletedTime()));
        return result;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public RestoreResultResponse restore(UUID id) {
        if (etterlevelseDokumentasjonRepo.existsById(id)) {
            throw new ValidationException("Etterlevelsesdokumentasjon med id " + id + " finnes allerede og kan ikke gjenopprettes.");
        }

        List<AuditVersion> parentAudit = auditVersionCustomRepo.findLatestDeletedByTableId(TABLE_ETTERLEVELSE_DOKUMENTASJON, id.toString());
        if (parentAudit.isEmpty()) {
            throw new ValidationException("Fant ingen slettet etterlevelsesdokumentasjon med id " + id + ".");
        }

        log.info("Restoring etterlevelsesdokumentasjon with id={}", id);
        restoreEntity(parentAudit.get(0), EtterlevelseDokumentasjon.class, etterlevelseDokumentasjonRepo);

        RestoreResultResponse result = RestoreResultResponse.builder()
                .etterlevelseDokumentasjonId(id.toString())
                .build();

        List<PvkDokument> restoredPvkDokumenter = restoreChildren(
                TABLE_PVK_DOKUMENT, FK_ETTERLEVELSE_DOKUMENT_ID, id.toString(), PvkDokument.class, pvkDokumentRepo);
        result.setRestoredPvkDokument(restoredPvkDokumenter.size());

        result.setRestoredEtterlevelser(restoreChildren(
                TABLE_ETTERLEVELSE, FK_ETTERLEVELSE_DOKUMENTASJON_ID, id.toString(), Etterlevelse.class, etterlevelseRepo).size());
        result.setRestoredEtterlevelseMetadata(restoreChildren(
                TABLE_ETTERLEVELSE_METADATA, FK_ETTERLEVELSE_DOKUMENTASJON_ID, id.toString(), EtterlevelseMetadata.class, etterlevelseMetadataRepo).size());
        result.setRestoredBehandlingensLivslop(restoreChildren(
                TABLE_BEHANDLINGENS_LIVSLOP, FK_ETTERLEVELSE_DOKUMENTASJON_ID, id.toString(), BehandlingensLivslop.class, behandlingensLivslopRepo).size());
        result.setRestoredBehandlingensArtOgOmfang(restoreChildren(
                TABLE_BEHANDLINGENS_ART_OG_OMFANG, FK_ETTERLEVELSE_DOKUMENTASJON_ID, id.toString(), BehandlingensArtOgOmfang.class, behandlingensArtOgOmfangRepo).size());

        for (PvkDokument pvkDokument : restoredPvkDokumenter) {
            String pvkId = pvkDokument.getId().toString();
            result.setRestoredRisikoscenario(result.getRestoredRisikoscenario() + restoreChildren(
                    TABLE_RISIKOSCENARIO, FK_PVK_DOKUMENT_ID, pvkId, Risikoscenario.class, risikoscenarioRepo).size());
            result.setRestoredTiltak(result.getRestoredTiltak() + restoreChildren(
                    TABLE_TILTAK, FK_PVK_DOKUMENT_ID, pvkId, Tiltak.class, tiltakRepo).size());
            result.setRestoredPvoTilbakemelding(result.getRestoredPvoTilbakemelding() + restoreChildren(
                    TABLE_PVO_TILBAKEMELDING, FK_PVK_DOKUMENT_ID, pvkId, PvoTilbakemelding.class, pvoTilbakemeldingRepo).size());
        }

        if (result.getRestoredRisikoscenario() > 0 && result.getRestoredTiltak() > 0) {
            result.getWarnings().add("Koblinger mellom risikoscenario og tiltak kan ikke gjenopprettes automatisk og må settes opp på nytt manuelt.");
        }

        return result;
    }

    private <T extends Auditable> List<T> restoreChildren(String tableName, String fkField, String fkValue, Class<T> type, JpaRepository<T, UUID> repo) {
        List<AuditVersion> audits = auditVersionCustomRepo.findLatestDeletedByTableAndFk(tableName, fkField, fkValue);
        List<T> restored = new ArrayList<>();
        for (AuditVersion audit : audits) {
            restored.add(restoreEntity(audit, type, repo));
        }
        return restored;
    }

    private <T extends Auditable> T restoreEntity(AuditVersion audit, Class<T> type, JpaRepository<T, UUID> repo) {
        T entity = JsonUtils.toObject(audit.getData(), type);
        entity.setVersion(null);
        return repo.save(entity);
    }

}
