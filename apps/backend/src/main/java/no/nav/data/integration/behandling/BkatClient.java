package no.nav.data.integration.behandling;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.web.TraceHeaderFilter;
import no.nav.data.integration.behandling.dto.BkatProcess;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static no.nav.data.common.utils.StreamUtils.toMap;


@Service
public class BkatClient {

    private final WebClient client;
    private final LoadingCache<String, List<BkatProcess>> processSearchCache;
    private final LoadingCache<String, BkatProcess> processCache;
    private final LoadingCache<String, List<BkatProcess>> processTeamCache;

    public BkatClient(WebClient.Builder webClientBuilder, BkatProperties properties) {
        this.client = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .filter(new TraceHeaderFilter(true))
                .build();

        this.processSearchCache = MetricUtils.register("bkatProcessSearchCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::search));
        this.processCache = MetricUtils.register("bkatProcessCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(300).build(this::getProcess0));
        this.processTeamCache = MetricUtils.register("bkatProcessTeamCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::findProcessesForTeam));
    }

    public BkatProcess getProcess(String id) {
        return processCache.get(id);
    }

    public List<BkatProcess> getProcessesById(List<String> ids) {
        var processes = processCache.getAll(ids, this::getProcesses0);
        return new ArrayList<>(processes.values());
    }

    public List<BkatProcess> findProcesses(String search) {
        return processSearchCache.get(search);
    }

    public List<BkatProcess> getProcessesForTeam(String teamId) {
        return processTeamCache.get(teamId);
    }

    private BkatProcess getProcess0(String id) {
        return get("/process/{id}", id, BkatProcess.class);
    }

    private Map<String, BkatProcess> getProcesses0(Iterable<? extends String> uncachedIds) {
        return toMap(post("/process/shortbyid", uncachedIds, ProcessPage.class).getContent(), BkatProcess::getId);
    }

    private List<BkatProcess> search(String search) {
        return get("/process/search/{search}", search, ProcessPage.class).getContent();
    }

    private List<BkatProcess> findProcessesForTeam(String teamId) {
        return get("/process?productTeam={teamId}", teamId, ProcessPage.class).getContent();
    }

    private <T> T get(String uri, String param, Class<T> response) {
        var res = client.get()
                .uri(uri, param)
                .retrieve()
                .bodyToMono(response)
                .block();
        Assert.isTrue(res != null, "response is null");

        return res;
    }

    private <T> T post(String uri, Object body, Class<T> response) {
        var res = client.post()
                .uri(uri)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(response)
                .block();
        Assert.isTrue(res != null, "response is null");

        return res;
    }

    private static class ProcessPage extends RestResponsePage<BkatProcess> {

    }

}
