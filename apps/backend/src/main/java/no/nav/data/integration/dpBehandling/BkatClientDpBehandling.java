package no.nav.data.integration.dpBehandling;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.web.TraceHeaderFilter;
import no.nav.data.integration.behandling.BkatProperties;
import no.nav.data.integration.dpBehandling.dto.BkatDpProcess;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;


@Slf4j
@Service
public class BkatClientDpBehandling {

    private final WebClient client;
    private final LoadingCache<String, List<BkatDpProcess>> dpProcessSearchCache;
    private final LoadingCache<String, BkatDpProcess> dpProcessCache;
    private final Cache<String, DpProcessPage> dpProcessPageCache;

    public BkatClientDpBehandling(WebClient.Builder webClientBuilder, BkatProperties properties) {
        this.client = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .filter(new TraceHeaderFilter(true))
                .build();

        this.dpProcessSearchCache = MetricUtils.register("bkatDpProcessSearchCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterWrite(Duration.ofMinutes(2))
                        .maximumSize(100).build(this::search));
        this.dpProcessCache = MetricUtils.register("bkatDpProcessCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterWrite(Duration.ofMinutes(2))
                        .maximumSize(300).build(this::getDpProcess0));

        this.dpProcessPageCache = MetricUtils.register("bkatDpProcessPageCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterWrite(Duration.ofMinutes(2))
                        .maximumSize(20).build());
    }

    public BkatDpProcess getDpProcess(String id) {
        return dpProcessCache.get(id);
    }

    public List<BkatDpProcess> findDpProcesses(String search) {
        return dpProcessSearchCache.get(search);
    }

    public RestResponsePage<BkatDpProcess> findByPage(int pageNumber, int pageSize) {
        return dpProcessPageCache.get("%d-%d".formatted(pageNumber, pageSize), key -> findByPage0(pageNumber, pageSize));
    }

    public DpProcessPage findByPage0(int pageNumber, int pageSize) {
        return get("/dpprocess?pageNumber={pageNumber}&pageSize={pageSize}", DpProcessPage.class, pageNumber, pageSize);
    }

    private <T> T get(String uri, Class<T> response, Object... params) {
        var res = client.get()
                .uri(uri, params)
                .retrieve()
                .bodyToMono(response)
                .block();
        Assert.isTrue(res != null, "response is null");

        return res;
    }

    private List<BkatDpProcess> search(String search) {
        return get("/dpprocess/search/{search}", DpProcessPage.class, search).getContent();
    }

    private BkatDpProcess getDpProcess0(String id) {
        return get("/dpprocess/{id}", BkatDpProcess.class, id);
    }


    private static class DpProcessPage extends RestResponsePage<BkatDpProcess> {

    }
}
