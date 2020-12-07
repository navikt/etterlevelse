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
import java.util.List;

@Service
public class BkatClient {

    private final WebClient client;
    private final LoadingCache<String, List<BkatProcess>> processSearchCache;
    private final LoadingCache<String, BkatProcess> processCache;

    public BkatClient(WebClient.Builder webClientBuilder, BkatProperties properties) {
        this.client = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .filter(new TraceHeaderFilter(true))
                .build();

        this.processSearchCache = MetricUtils.register("bkatProcessSearchCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::findProcesses0));
        this.processCache = MetricUtils.register("bkatProcessCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(300).build(this::getProcess0));
    }

    public BkatProcess getProcess(String id) {
        return processCache.get(id);
    }

    public List<BkatProcess> findProcesses(String search) {
        return processSearchCache.get(search);
    }

    private BkatProcess getProcess0(String id) {
        var res = client.get()
                .uri("/process/{id}", id)
                .retrieve()
                .bodyToMono(BkatProcess.class)
                .block();
        Assert.isTrue(res != null, "response is null");

        return res;
    }

    private List<BkatProcess> findProcesses0(String search) {
        var res = client.get()
                .uri("/process/search/{search}", search)
                .retrieve()
                .bodyToMono(ProcessPage.class)
                .block();
        Assert.isTrue(res != null, "response is null");

        return res.getContent();
    }

    private static class ProcessPage extends RestResponsePage<BkatProcess> {

    }

}
