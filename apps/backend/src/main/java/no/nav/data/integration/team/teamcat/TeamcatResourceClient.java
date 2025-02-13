package no.nav.data.integration.team.teamcat;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.integration.team.dto.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.util.function.Predicate.not;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.common.utils.StreamUtils.toMap;

@Slf4j
@Service
public class TeamcatResourceClient {

    private final RestTemplate restTemplate;
    private final TeamcatProperties properties;

    private final LoadingCache<String, RestResponsePage<Resource>> searchCache;
    private final LoadingCache<String, Resource> cache;
    private final LoadingCache<String, byte[]> photoCache;

    public TeamcatResourceClient(RestTemplate restTemplate, TeamcatProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;

        this.searchCache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(1000).build(this::doSearch);
        this.cache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(1000).build(this::fetchResource);
        this.photoCache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(1000).build(this::fetchResourcePhoto);
        MetricUtils.register("teamcatResourcesSearchCache", searchCache);
        MetricUtils.register("teamcatResourcesCache", cache);
        MetricUtils.register("teamcatResourcePhotoCache", photoCache);
    }

    public Optional<Resource> getResource(String ident) {
        return Optional.ofNullable(cache.get(ident));
    }

    public Map<String, Resource> getResources(Collection<String> idents) {
        return cache.getAll(idents, this::getResources0);
    }

    public Optional<byte[]> getResourcePhoto(String id) {
        return Optional.ofNullable(photoCache.get(id));
    }

    public RestResponsePage<Resource> search(String name) {
        return searchCache.get(name);
    }

    private Resource fetchResource(String ident) {
        try {
            var response = restTemplate.getForEntity(properties.getResourceUrl(), Resource.class, ident);
            Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to teamcat failed " + response.getStatusCode());
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error while connecting to teamcatalog.", e);
            return null;
        }
    }

    private byte[] fetchResourcePhoto(String ident) {
        try {
            var response = restTemplate.getForEntity(properties.getResourcePhotoUrl(), byte[].class, ident);
            Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to teamcat failed " + response.getStatusCode());
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error while connecting to teamcatalog.", e);
            return null;
        }
    }

    private Map<String, Resource> getResources0(Iterable<? extends String> idents) {
        try {
            var response = restTemplate.postForEntity(properties.getResourcesUrl(), idents, ResourcePage.class);
            Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to teamcat failed " + response.getStatusCode());
            Assert.isTrue(response.getBody() != null, "response is null");
            List<Resource> resources = response.getBody().getContent();
            log.info("fetched {} resources from teamkat", resources.size());
            Map<String, Resource> results = toMap(resources, Resource::getNavIdent);

            safeStream(idents)
                    .filter(not(results.keySet()::contains))
                    .forEach(ident -> results.put(ident, new Resource(ident)));

            return results;
        } catch (RestClientException e) {
            log.error("Error while connecting to teamcatalog.", e);
            return null;
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
