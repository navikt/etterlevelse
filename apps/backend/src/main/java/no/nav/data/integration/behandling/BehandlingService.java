package no.nav.data.integration.behandling;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.integration.behandling.dto.Behandling;
import no.nav.data.integration.behandling.dto.BkatProcess;
import no.nav.data.integration.behandling.dto.BkatProcessor;
import no.nav.data.integration.behandling.dto.DataBehandler;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.convert;

@Service
@RequiredArgsConstructor
public class BehandlingService {

    private final BkatClient bkatClient;

    private List<DataBehandler> getDatabehandlerForBehandling(BkatProcess process) {
        List<DataBehandler> dataBehandlerList = new ArrayList<>();
        if(process.getDataProcessing() != null && !process.getDataProcessing().getProcessors().isEmpty()) {
            process.getDataProcessing().getProcessors().forEach(databehandlerId -> {
                DataBehandler databehandler = getDataBehandler(databehandlerId);
                if(databehandler != null) {
                    dataBehandlerList.add(databehandler);
                }
            });
        }
        return dataBehandlerList;
    }

    public Behandling getBehandling(String id) {
        BkatProcess process = bkatClient.getProcess(id);
        if (process == null) {
            return null;
        }

        Behandling behandling = process.convertToBehandling();
        List<DataBehandler> dataBehandlerList = getDatabehandlerForBehandling(process);
        behandling.setDataBehandlerList(dataBehandlerList);
        return behandling;
    }

    public List<Behandling> getBehandlingerForTeam(String teamId) {
        return convertBehandlinger(bkatClient.getProcessesForTeam(teamId));
    }

    public List<Behandling> findBehandlinger(String search) {
        return convertBehandlinger(bkatClient.findProcesses(search));
    }

    public List<Behandling> findAllById(List<String> ids) {
        return convertBehandlinger(bkatClient.getProcessesById(ids).values());
    }

    public Map<String, Behandling> findAllByIdMapped(Collection<String> ids) {
        return bkatClient.getProcessesById(ids).entrySet().stream()
                .collect(Collectors.toMap(Entry::getKey, e -> e.getValue().convertToBehandling()));
    }

    public RestResponsePage<Behandling> getAll(Pageable page) {
        RestResponsePage<BkatProcess> behPage = bkatClient.findByPage(page.getPageNumber(), page.getPageSize());
        return behPage.convertBatch(this::convertBehandlinger);
    }

    private List<Behandling> convertBehandlinger(Collection<BkatProcess> processes) {
        return convert(processes, BkatProcess::convertToBehandling);
    }

    public DataBehandler getDataBehandler(String id) {
        BkatProcessor dataBehandler = bkatClient.getProcessor(id);
        if (dataBehandler == null) {
            return null;
        }
        return dataBehandler.convertToDataBehandler();
    }
}
