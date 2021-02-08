package no.nav.data.etterlevelse.behandling;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.behandling.domain.BehandlingData;
import no.nav.data.etterlevelse.behandling.domain.BehandlingRepo;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.behandling.dto.BehandlingFilter;
import no.nav.data.etterlevelse.behandling.dto.BehandlingRequest;
import no.nav.data.integration.behandling.BkatClient;
import no.nav.data.integration.behandling.dto.BkatProcess;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
public class BehandlingService {

    private final BkatClient bkatClient;
    private final StorageService storage;
    private final BehandlingRepo repo;

    public BehandlingService(StorageService storage, BkatClient bkatClient, BehandlingRepo repo) {
        this.bkatClient = bkatClient;
        this.storage = storage;
        this.repo = repo;
    }

    public Behandling save(BehandlingRequest request) {
        Validator.validate(request)
                .ifErrorsThrowValidationException();
        var behandling = getBehandling(request.getId());

        BehandlingData bd = behandling.getBehandlingData();
        bd.convert(request);
        bd = storage.save(bd);

        behandling.includeData(bd);
        return behandling;
    }

    public Behandling getBehandling(String id) {
        BkatProcess process = bkatClient.getProcess(id);
        if (process == null) {
            return null;
        }
        return convertBehandling(process);
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

    public List<Behandling> getByFilter(BehandlingFilter filter) {
        if (!StringUtils.isBlank(filter.getId())) {
            return List.of(convertBehandling(bkatClient.getProcess(filter.getId())));
        }
        List<GenericStorage> datas = repo.findByRelevans(filter.getRelevans());
        List<String> behandlingIds = convert(GenericStorage.to(datas, BehandlingData.class), BehandlingData::getBehandlingId);
        Collection<BkatProcess> processes = bkatClient.getProcessesById(behandlingIds).values();
        return convert(processes, p -> convertBeh(p, datas));
    }

    public RestResponsePage<Behandling> getAll(Pageable page) {
        RestResponsePage<BkatProcess> behPage = bkatClient.findByPage(page.getPageNumber(), page.getPageSize());
        return behPage.convertBatch(this::convertBehandlinger);
    }

    private List<Behandling> convertBehandlinger(Collection<BkatProcess> processes) {
        List<String> ids = convert(processes, BkatProcess::getId);
        var datas = repo.findByBehandlingIds(ids);
        return convert(processes, p -> convertBeh(p, datas));
    }

    private Behandling convertBehandling(BkatProcess process) {
        return convertBeh(process, repo.findByBehandlingIds(List.of(process.getId())));
    }

    private Behandling convertBeh(BkatProcess process, Collection<GenericStorage> behandlingDatas) {
        Behandling convert = process.convertToBehandling();
        StreamUtils.tryFind(behandlingDatas, bd -> bd.toBehandlingData().getBehandlingId().equals(process.getId()))
                .ifPresentOrElse(bd -> convert.includeData(bd.toBehandlingData()), () -> convert.includeData(new BehandlingData()));
        return convert;
    }
}
