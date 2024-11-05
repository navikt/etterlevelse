package no.nav.data.etterlevelse.codelist;

import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import org.springframework.util.Assert;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Should not be used outside {@link CodelistService}
 */
final class CodelistCache {

    private CodelistCache() {
    }

    private static CodelistCache cache;

    private final Map<ListName, Map<String, Codelist>> codelists = new EnumMap<>(ListName.class);

    static {
        CodelistCache.init();
    }

    static synchronized void init() {
        init(null);
    }

    static synchronized void init(Consumer<CodelistCache> consumer) {
        var newCache = new CodelistCache();
        Stream.of(ListName.values()).forEach(listName -> newCache.codelists.put(listName, new HashMap<>()));
        if (consumer != null) {
            consumer.accept(newCache);
        }
        cache = newCache;
    }

    static synchronized List<Codelist> getAll() {
        return cache.codelists.values().stream().flatMap(e -> e.values().stream()).collect(Collectors.toList());
    }

    static synchronized List<Codelist> getCodelist(ListName name) {
        return List.copyOf(cache.codelists.get(name).values());
    }

    static synchronized Codelist getCodelist(ListName listName, String code) {
        return cache.codelists.get(listName).get(code);
    }

    static synchronized boolean contains(ListName listName, String code) {
        return cache.codelists.get(listName).containsKey(code);
    }

    static synchronized void remove(ListName listName, String code) {
        cache.codelists.get(listName).remove(code);
    }

    static synchronized void set(Codelist codelist) {
        cache.setCode(codelist);
    }

    void setCode(Codelist codelist) {
        Assert.notNull(codelist.getList(), "listName cannot be null");
        Assert.notNull(codelist.getCode(), "code cannot be null");
        Assert.notNull(codelist.getDescription(), "description cannot be null");
        Assert.notNull(codelist.getShortName(), "shortName cannot be null");
        synchronized(CodelistCache.class) {
            codelists.get(codelist.getList()).put(codelist.getCode(), codelist);
        }
    }
}
