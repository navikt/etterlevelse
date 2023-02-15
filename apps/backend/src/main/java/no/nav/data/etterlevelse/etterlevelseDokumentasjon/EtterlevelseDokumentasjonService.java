package no.nav.data.etterlevelse.etterlevelseDokumentasjon;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class EtterlevelseDokumentasjonService extends DomainService<EtterlevelseDokumentasjon>{

    private final AuditVersionRepository auditRepo;

    public EtterlevelseDokumentasjonService(AuditVersionRepository auditRepo) {
        super(EtterlevelseDokumentasjon.class);
        this.auditRepo = auditRepo;
    }
    public EtterlevelseDokumentasjon save(EtterlevelseDokumentasjonRequest request) {

        var etterlevelseDokumentasjon = request.isUpdate() ? storage.get(request.getIdAsUUID(), EtterlevelseDokumentasjon.class) : new EtterlevelseDokumentasjon();

        etterlevelseDokumentasjon.convert(request);

        if (!request.isUpdate()) {
            etterlevelseDokumentasjon.setEtterlevelseNummer(etterlevelseDokumentasjonRepo.nextEtterlevelseDokumentasjonNummer());
        }

        return storage.save(etterlevelseDokumentasjon);
    }

    public List<EtterlevelseDokumentasjon> getByBehandlingId(List<String> ids) {
        return GenericStorage.to(etterlevelseDokumentasjonRepo.findByBehandlingIds(ids), EtterlevelseDokumentasjon.class);
    }


}
