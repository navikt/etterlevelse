package no.nav.data.integration.dpBehandling;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.integration.dpBehandling.dto.BkatDpProcess;
import no.nav.data.integration.dpBehandling.dto.DpBehandling;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;


@Service
@RequiredArgsConstructor
public class DpBehandlingService {

    private final BkatClientDpBehandling bkatClientDpBehandling;

    public DpBehandling getDpBehandling(String id) {
        BkatDpProcess dpProcess = bkatClientDpBehandling.getDpProcess(id);
        if (dpProcess == null) {
            return null;
        }
        return dpProcess.convertToDpBehandling();
    }

    public List<DpBehandling> findDpBehandlinger(String search) {
        return convertDpBehandlinger(bkatClientDpBehandling.findDpProcesses(search));
    }

    public RestResponsePage<DpBehandling> getAll(Pageable page) {
        RestResponsePage<BkatDpProcess> dpBehPage = bkatClientDpBehandling.findByPage(page.getPageNumber(), page.getPageSize());
        return dpBehPage.convertBatch(this::convertDpBehandlinger);
    }

    private List<DpBehandling> convertDpBehandlinger(Collection<BkatDpProcess> dpProcesses) {
        return convert(dpProcesses, BkatDpProcess::convertToDpBehandling);
    }
}
