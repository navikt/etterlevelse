package no.nav.data.integration.team.teamcat;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.integration.team.dto.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Optional;

@Service
public class TeamcatResourceClient {

    private final RestTemplate restTemplate;
    private final TeamcatProperties properties;

    private final LoadingCache<String, RestResponsePage<Resource>> searchCache;
    private final LoadingCache<String, Resource> cache;

    public TeamcatResourceClient(RestTemplate restTemplate,
            TeamcatProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;

        this.searchCache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(1000).build(this::doSearch);
        this.cache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(1000).build(this::fetchResource);
        MetricUtils.register("teamcatResourcesSearchCache", searchCache);
        MetricUtils.register("teamcatResourcesCache", cache);
    }

    public Optional<Resource> getResource(String ident) {
        return Optional.ofNullable(cache.get(ident));
    }

    public RestResponsePage<Resource> search(String name) {
        return searchCache.get(name);
    }

    private Resource fetchResource(String ident) {
        try {
            var response = restTemplate.getForEntity(properties.getResourceUrl(), Resource.class, ident);
            Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to teamcat failed " + response.getStatusCode());
            return response.getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            throw e;
        }
    }

    private RestResponsePage<Resource> doSearch(String name) {
        var response = restTemplate.getForEntity(properties.getResourceSearchUrl(), ResourcePage.class, name);
        Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to teamcat failed " + response.getStatusCode());
        return response.getBody();
    }

    static class ResourcePage extends RestResponsePage<Resource> {

    }
}
