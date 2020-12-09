package no.nav.data.etterlevelse.behandling;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.integration.behandling.BkatClient;
import no.nav.data.integration.behandling.dto.BkatProcess;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BehandlingService {

    private final BkatClient bkatClient;

    public Behandling getBehandling(String id) {
        BkatProcess process = bkatClient.getProcess(id);
        if (process == null) {
            return null;
        }
        return process.convertToBehandling();
    }

    public List<Behandling> getBehandlingerForTeam(String teamId) {
        return convert(bkatClient.getProcessesForTeam(teamId));
    }

    public List<Behandling> findBehandlinger(String search) {
        return convert(bkatClient.findProcesses(search));
    }

    private List<Behandling> convert(List<BkatProcess> processes) {
        return StreamUtils.convert(processes, BkatProcess::convertToBehandling);
    }

    public List<Behandling> findAllById(List<String> ids) {
        return convert(bkatClient.getProcessesById(ids));
    }
}
